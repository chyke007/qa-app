import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  KendraClient,
  RetrieveCommand,
  RetrieveCommandOutput,
} from "@aws-sdk/client-kendra";
import { Amplify, withSSRContext } from "aws-amplify";

import type { NextApiRequest, NextApiResponse } from "next";
import awsExports from "@/aws-exports";

Amplify.configure({ ...awsExports, ssr: true });

async function retrieve_kendra_docs(
  kendraClient: KendraClient,
  QueryText: string
): Promise<RetrieveCommandOutput> {
  try {
    const input = {
      IndexId: process.env.kendraId,
      QueryText,
    };

    const command = new RetrieveCommand(input);
    return await kendraClient.send(command);
  } catch (e) {
    console.log(e);
    return {
      ResultItems: [{ Content: "" }],
    } as RetrieveCommandOutput;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const question = JSON.parse(req.body).question;
  if (!question) {
    return res.status(400).json({ error: "Please provide question" });
  }

  const SSR = withSSRContext({ req });
  const credentials = await SSR.Auth.currentCredentials();
  const settings = {
    serviceId: "bedrock",
    region: "us-east-1",
    credentials,
  };
  const bedrock = new BedrockRuntimeClient(settings);
  const kendraClient = new KendraClient(settings);

  let context = await retrieve_kendra_docs(kendraClient, question);
  const chunks = context!.ResultItems!.map(
    (retrieveResult) => retrieveResult.Content
  );

  let refinedContext = chunks.join("\n");
  const prompt = `Human:You are a friendly, concise chatbot. Here is some context, contained in <context> tags:

    <context>
    ${refinedContext}
    </context>

    Given the context answer this question: ${question}
    \n\nAssistant:`;

  const result = await bedrock.send(
    new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      contentType: "application/json",
      accept: "*/*",
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 2000,
        temperature: 1,
        top_k: 250,
        top_p: 0.99,
        stop_sequences: ["\n\nHuman:"],
        anthropic_version: "bedrock-2023-05-31",
      }),
    })
  );
  res.status(200).json(JSON.parse(new TextDecoder().decode(result.body)));
}
