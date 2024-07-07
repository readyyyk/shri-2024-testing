import { basename, baseUrl } from "./config";
import { PAGES } from "../shared-config";

describe("Каталог", function () {
  it("", async ({ browser }) => {
    await browser.url(baseUrl + basename + PAGES["каталог"]);
  });
});
