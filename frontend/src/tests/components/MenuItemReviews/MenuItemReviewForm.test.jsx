import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "vitest";

import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const originalModule = await vi.importActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "ItemId",
    "ReviewerEmail",
    "Stars",
    "Comments",
    "DateReviewed",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm initialContents={menuItemReviewFixtures.oneMIR} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/The itemId is required./);
    expect(
      screen.getByText(/The reviewerEmail is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/The stars are required./)).toBeInTheDocument();
    expect(screen.getByText(/The comments are required./)).toBeInTheDocument();
    expect(
      screen.getByText(/The dateReviewed is required./),
    ).toBeInTheDocument();

    const nameInput = screen.getByTestId(`${testId}-itemId`);
    fireEvent.change(nameInput, { target: { value: "1".repeat(31) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });

    const nInput = screen.getByTestId(`${testId}-itemId`);
    fireEvent.change(nInput, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/itemId must be at least 0/)).toBeInTheDocument();
    });

    const nameInput2 = screen.getByTestId(`${testId}-reviewerEmail`);
    fireEvent.change(nameInput2, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Email must have max length of 255 characters./),
      ).toBeInTheDocument();
    });

    const nameInput3 = screen.getByTestId(`${testId}-stars`);
    fireEvent.change(nameInput3, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Stars must be min 0/)).toBeInTheDocument();
    });

    const nameInput4 = screen.getByTestId(`${testId}-stars`);
    fireEvent.change(nameInput4, { target: { value: "200" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Stars must be max 5/)).toBeInTheDocument();
    });

    const nameInput5 = screen.getByTestId(`${testId}-comments`);
    fireEvent.change(nameInput5, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Comments have max length of 255 characters./),
      ).toBeInTheDocument();
    });

    fireEvent.change(nameInput5, { target: { value: "a".repeat(255) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Comments have max length of 255 characters./),
      ).not.toBeInTheDocument();
    });
  });
});
