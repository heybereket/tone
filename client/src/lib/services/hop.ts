import { APIAuthentication, Hop } from "@onehop/js";

export const hop = new Hop(process.env.HOP_PROJECT_TOKEN as APIAuthentication);
