import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UserForm from "./UserForm";

// The admin sets a password for ANOTHER user here. Without
// autocomplete="new-password" the browser autofills the admin's own saved
// password into the field and it can be submitted for the new account.
function renderPasswordInput(mode: "create" | "edit"): string {
  const html = renderToStaticMarkup(
    createElement(UserForm, {
      mode,
      roles: [],
      onSubmit: async () => {},
    }),
  );
  const match = html.match(/<input[^>]*type="password"[^>]*>/);
  expect(match).not.toBeNull();
  return match![0];
}

describe("UserForm password field", () => {
  it.each(["create", "edit"] as const)(
    "uses autocomplete=new-password in %s mode",
    (mode) => {
      expect(renderPasswordInput(mode)).toMatch(
        /autocomplete="new-password"/i,
      );
    },
  );
});
