import {
  Controller,
  Get,
  Header,
  Headers,
  Query,
  Req,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { createReadStream, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("a")
  @Header("Content-Type", "text/html; charset=utf-8")
  getAPage() {
    const stream = createReadStream(resolve(__dirname, "assets/pageA.html"));
    return new StreamableFile(stream);
  }

  @Get("b")
  @Header("Content-Type", "text/html; charset=utf-8")
  getBPage() {
    const stream = createReadStream(resolve(__dirname, "assets/pageB.html"));
    return new StreamableFile(stream);
  }

  @Get("partitioned")
  @Header("Content-Type", "text/html; charset=utf-8")
  async getADPartitioned(
    @Query("by") by: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (by === "a") {
      res.set("set-cookie", "name=xqv; SameSite=None; Secure; Partitioned;");
    }
    const stream = createReadStream(
      resolve(__dirname, "assets/ad-partitioned.html")
    );
    return new StreamableFile(stream);
  }

  @Get("site-a")
  @Header("Content-Type", "text/html; charset=utf-8")
  getSiteAPage(@Res({ passthrough: true }) res: Response) {
    const stream = createReadStream(resolve(__dirname, "assets/site-a.html"));
    return new StreamableFile(stream);
  }

  @Get("site-b")
  @Header("Content-Type", "text/html; charset=utf-8")
  getSiteBPage(@Res({ passthrough: true }) res: Response) {
    const stream = createReadStream(resolve(__dirname, "assets/site-b.html"));
    return new StreamableFile(stream);
  }

  @Get("ad")
  @Header("Content-Type", "text/html; charset=utf-8")
  getADPage(
    @Query("by") by: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (by === "site-a") {
      res.set("set-cookie", "name=xqv; SameSite=None; Secure;");
    }
    const stream = createReadStream(resolve(__dirname, "assets/ad.html"));
    return new StreamableFile(stream);
  }
}
