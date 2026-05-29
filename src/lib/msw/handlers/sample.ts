import { HttpResponse, http, type RequestHandler } from "msw";

const helloHandler = http.get("http://localhost:3000/hello", () => {
  return HttpResponse.json({
    message: "Hello World !!",
  });
});

export const sampleHandlers: RequestHandler[] = [helloHandler];
