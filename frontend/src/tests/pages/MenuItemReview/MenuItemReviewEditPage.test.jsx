import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: () => ({
      id: 1,
    }),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/menuitemreview", { params: { id: 1 } }).timeout();
    });

    test("renders header but table is not present", async () => {
      const queryClient = new QueryClient();
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Menu Item Review");
      expect(
        screen.queryByTestId("MenuItemReview-name"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/menuitemreview", { params: { id: 1 } })
        .reply(200, menuItemReviewFixtures.oneMIR);
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: 1,
        itemId: 2,
        reviewerEmail: "b@gmail.com",
        stars: 2,
        comments: "Updated MIR",
        dateReviewed: "2026-04-10T14:00:00",
      });
    });

    test("Is populated with the data provided", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemidField = screen.getByTestId("MenuItemReviewForm-itemId");
      const reField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
      const starsField = screen.getByTestId("MenuItemReviewForm-stars");
      const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReviewForm-dateReviewed",
      );
      const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(itemidField).toBeInTheDocument();
      expect(itemidField).toHaveValue(1);
      expect(reField).toBeInTheDocument();
      expect(reField).toHaveValue("a@gmail.com");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(1);
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("MIR");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2026-03-10T14:00");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemidField, { target: { value: "2" } });
      fireEvent.change(reField, { target: { value: "b@gmail.com" } });
      fireEvent.change(starsField, { target: { value: "2" } });
      fireEvent.change(commentsField, { target: { value: "Updated MIR" } });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-04-10T14:00" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 1 itemId: 2",
      );
      await waitFor(() =>
        expect(mockNavigate).toBeCalledWith({ to: "/menuItemReview" }),
      );

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "2",
          reviewerEmail: "b@gmail.com",
          stars: "2",
          comments: "Updated MIR",
          dateReviewed: "2026-04-10T14:00",
        }),
      );
    });

    test("Changes when you click Update", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemidField = screen.getByTestId("MenuItemReviewForm-itemId");
      const reField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
      const starsField = screen.getByTestId("MenuItemReviewForm-stars");
      const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReviewForm-dateReviewed",
      );
      const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

      expect(idField).toHaveValue("1");
      expect(itemidField).toHaveValue(1);
      expect(reField).toHaveValue("a@gmail.com");
      expect(starsField).toHaveValue(1);
      expect(commentsField).toHaveValue("MIR");
      expect(dateReviewedField).toHaveValue("2026-03-10T14:00");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(itemidField, { target: { value: "2" } });
      fireEvent.change(reField, { target: { value: "b@gmail.com" } });
      fireEvent.change(starsField, { target: { value: "2" } });
      fireEvent.change(commentsField, { target: { value: "Updated MIR" } });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-04-10T14:00" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 1 itemId: 2",
      );
      await waitFor(() =>
        expect(mockNavigate).toBeCalledWith({ to: "/menuItemReview" }),
      );
    });
  });
});
