import { ActorSystem } from "@yingyeothon/actor-system";
import {
  handleActorLambdaEvent,
  shiftToNextLambda
} from "@yingyeothon/actor-system-aws-lambda-support";
import { RedisLock, RedisQueue } from "@yingyeothon/actor-system-redis-support";
import IORedis from "ioredis";
import { DateTime } from "luxon";
import mem from "mem";
import { v4 as uuidv4 } from "uuid";
import { INote } from "../model";
import { getRepository } from "../repository";
import { Modification } from "./message";

export const getRedis = mem(() => {
  return new IORedis({
    host: process.env.REDIS_HOST!,
    password: process.env.REDIS_PASSWORD!
  });
});

const emptyNote = (noteId: string): INote => ({
  noteId,
  content: "",
  comments: [],
  writeDate: ""
});

export const getActorSystem = mem(
  () =>
    new ActorSystem({
      queue: new RedisQueue({ redis: getRedis() }),
      lock: new RedisLock({ redis: getRedis() })
    })
);

class NoteProcessor {
  private note: INote | null = null;

  constructor(private readonly noteId: string) {}

  public onBeforeAct = async () => {
    this.note =
      (await getRepository().get<INote>(this.noteId)) || emptyNote(this.noteId);
  };

  public onAfterAct = async () => {
    await getRepository().set(this.noteId, this.note);
  };

  public onMessage = ({ message }: { message: Modification }) => {
    switch (message.type) {
      case "new":
        this.note = {
          noteId: this.noteId,
          content: message.content,
          writeDate: DateTime.local().toISO(),
          comments: []
        };
        break;
      case "addComment":
        this.note!.comments.push({
          commentId: uuidv4(),
          content: message.content,
          writeDate: DateTime.local().toISO()
        });
        break;
      case "deleteComment":
        this.note!.comments = this.note!.comments.filter(
          each => each.commentId !== message.commentId
        );
        break;
    }
    console.info(`onMessage`, message, this.note);
  };
}

const getActor = mem((noteId: string) => {
  const processor = new NoteProcessor(noteId);
  return getActorSystem().spawn<Modification>(noteId, actor =>
    actor
      .on("beforeAct", processor.onBeforeAct)
      .on("afterAct", processor.onAfterAct)
      .on("act", processor.onMessage)
      .on("error", error => console.error(`ActorError`, noteId, error))
      .on(
        "shift",
        shiftToNextLambda({
          functionName: process.env.BOTTOM_HALF_LAMBDA_NAME!
        })
      )
  );
});

const topHalfTimeout = 24 * 1000;
const bottomHalfTimeout = 890 * 1000;

export const postModification = (noteId: string, modification: Modification) =>
  getActor(noteId).send(modification, {
    shiftTimeout: topHalfTimeout
  });

export const bottomHalf = handleActorLambdaEvent({
  spawn: ({ actorName }) => getActor(actorName),
  functionTimeout: bottomHalfTimeout
});
