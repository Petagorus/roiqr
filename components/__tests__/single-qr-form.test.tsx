import * as React from "react";

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, type RenderOptions } from "@testing-library/react";

import { SingleQrForm } from "@/components/single-qr-form";
import { ToastProvider } from "@/components/ui/toast-provider";
import { I18nProvider } from "@/lib/i18n-provider";

vi.mock("@/lib/qr-client", () => ({
  generateQrClient: vi.fn().mockResolvedValue({
    dataUrl: "data:image/png;base64,STUB",
    payload: "https://example.com",
    bytes: 19,
  }),
}));

// Wrap components in the i18n + toast providers since they consume useI18n()
// and useToast().
function renderWithProvider(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <I18nProvider>
      <ToastProvider>{ui}</ToastProvider>
    </I18nProvider>,
    options,
  );
}

describe("SingleQrForm", () => {
  it("renders the form and enables download once content is entered", async () => {
    renderWithProvider(<SingleQrForm />);

    const download = screen.getByRole("button", { name: /download png/i });
    expect(download).toBeDisabled();

    const input = await screen.findByLabelText(/website url/i);
    fireEvent.change(input, { target: { value: "https://example.com" } });

    await waitFor(() => expect(download).toBeEnabled());
  });

  it("shows the payload text once content is entered", async () => {
    renderWithProvider(<SingleQrForm />);
    const input = await screen.findByLabelText(/website url/i);
    fireEvent.change(input, { target: { value: "https://example.com" } });

    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });
  });
});
