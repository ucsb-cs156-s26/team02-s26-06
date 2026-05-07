import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("ItemId")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 1,
      itemId: "1",
      reviewerEmail: "aidenhunter@ucsb.edu",
      stars: "5",
      comments: "I love in n out!",
      dateReviewed: "2026-06-12T14:00",
    };

    axiosMock.onPost("/api/menuitemreview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("ItemId")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("ItemId"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("ReviewerEmail"), {
      target: { value: "aidenhunter@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Stars"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Comments"), {
      target: { value: "I love in n out!" },
    });
    fireEvent.change(screen.getByLabelText("DateReviewed"), {
      target: { value: "2026-06-12T14:00" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "1",
      reviewerEmail: "aidenhunter@ucsb.edu",
      stars: "5",
      comments: "I love in n out!",
      dateReviewed: "2026-06-12T14:00",
    });

    expect(mockToast).toBeCalledWith(
      "New Menu Item Review Created - itemId: 1 reviewerEmail: aidenhunter@ucsb.edu stars: 5 comments: I love in n out! dateReviewed: 2026-06-12T14:00",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });
});
