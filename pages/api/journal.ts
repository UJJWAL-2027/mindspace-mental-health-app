import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { createJournal, getJournals } from "../../controllers/journalController";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const userId = session?.user?.email;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "POST") {
    const { entry } = req.body;
    const { error } = await createJournal(userId, entry);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const { data, error } = await getJournals(userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).end();
}