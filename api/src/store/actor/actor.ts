import * as Actor from "@yingyeothon/actor-system";
import { IActorSubsystem } from "@yingyeothon/actor-system";
import {
  handleActorLambdaEvent,
  shiftToNextLambda
} from "@yingyeothon/actor-system-aws-lambda-support";
import { newRedisSubsystem } from "@yingyeothon/actor-system-redis-support";
import { ConsoleLogger } from "@yingyeothon/logger";
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

const subsys: IActorSubsystem = {
  ...newRedisSubsystem({
    redis: getRedis(),
    keyPrefix: `yingnote`,
    logger: new ConsoleLogger(`debug`)
  }),
  shift: shiftToNextLambda({
    functionName: process.env.BOTTOM_HALF_LAMBDA_NAME!
  })
};

class NoteActor {
  private note: INote | null = null;

  constructor(public readonly id: string) {}

  public onPrepare = async () => {
    this.note =
      (await getRepository().get<INote>(this.id)) || emptyNote(this.id);
  };

  public onCommit = async () => {
    await getRepository().set(this.id, this.note);
  };

  public onMessage = async (message: Modification) => {
    switch (message.type) {
      case "upsertNote":
        this.note = {
          noteId: this.id,
          content: message.content,
          writeDate: DateTime.local().toISO(),
          comments: this.note.comments || []
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

const newActor = (noteId: string) =>
  Actor.newEnv(subsys)(new NoteActor(noteId));

const topHalfTimeout = 3 * 1000;
const bottomHalfTimeout = 30 * 1000;

export const postModification = (noteId: string, modification: Modification) =>
  Actor.send(
    newActor(noteId),
    {
      item: modification,
      awaitPolicy: Actor.AwaitPolicy.Commit,
      awaitTimeoutMillis: topHalfTimeout
    },
    {
      aliveMillis: topHalfTimeout,
      oneShot: true,
      shiftable: true
    }
  );

export const bottomHalf = handleActorLambdaEvent({
  newActorEnv: ({ actorId }) => newActor(actorId),
  processOptions: {
    aliveMillis: bottomHalfTimeout,
    oneShot: false,
    shiftable: true
  },
  logger: new ConsoleLogger(`debug`)
});
