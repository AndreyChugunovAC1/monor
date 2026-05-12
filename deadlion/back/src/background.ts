import webpush from 'web-push';
import { db } from "./db";
import { mots, users } from "./db/schema";
import { and, eq, isNotNull, lte } from "drizzle-orm";
import { logger } from "./utils/logging";

export const backgroundSendPush = async () => {
  webpush.setVapidDetails(
    'mailto:lugushik@gmail.com',
    process.env.WEBPUSH_PUBLIC_KEY!,
    process.env.WEBPUSH_PRIVATE_KEY!
  )

  while (true) {
    try {
      // choose mots to send:
      const now = new Date()
      const allSendData = await db
        .select({
          id: mots.id,
          title: mots.title,
          descr: mots.descr,
          asi: mots.asi,
          pushSub: users.pushSub,
        })
        .from(mots)
        .innerJoin(users, eq(users.id, mots.owner))
        .where(and(
          lte(mots.nextSending, now),
          isNotNull(users.pushSub)
        ))

      // trying to send:
      for (const sendData of allSendData) {
        let subscription: any
        try {
          subscription = JSON.parse(sendData.pushSub!)
        } catch (err) {
          // TODO: bad subscription - delete it???
        }
        try {
          const payload = {
            title: sendData.title,
            descr: sendData.descr
          }
          await webpush.sendNotification(subscription, JSON.stringify(payload), {
            TTL: 24 * 60 * 60
          })
        } catch (err) {
          logger.error(err)
        }
      }

      // update all mots
      await db.transaction(async (tx) => {
        for (const mot of allSendData) {
          const nowt = Date.now();
          await tx
            .update(mots)
            .set({
              nextSending: new Date(nowt + (0.5 + Math.random()) * mot.asi * 24 * 60 * 60 * 1000)
            })
            .where(eq(mots.id, mot.id));
        }
      });
      await Bun.sleep(10000)
    } catch (err) {
      logger.error(err)
      await Bun.sleep(60000)
    }
  }
}