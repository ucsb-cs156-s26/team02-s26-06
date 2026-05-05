import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticleCreatePage from "main/pages/Articles/ArticlesCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("ArticleCreatePage tests", () => {
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
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 7,
      title: "Why are there so many daffodils in Jersey?",
      url: "https://www.bbc.com/news/articles/cx2l20rwxgxo",
      explanation: "Explaining the daffodil bloom",
      email: "prishabobde@gmail.com",
      dateAdded: "2024-12-12T05:06:05",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    expect(titleInput).toBeInTheDocument();

    const urlInput = screen.getByLabelText("Url");
    expect(urlInput).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const dateAddedInput = screen.getByLabelText("Date Added(iso format)");
    expect(dateAddedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, {
      target: { value: "Why are there so many daffodils in Jersey?" },
    });
    fireEvent.change(urlInput, {
      target: { value: "https://www.bbc.com/news/articles/cx2l20rwxgxo" },
    });
    fireEvent.change(emailInput, {
      target: { value: "prishabobde@gmail.com" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "Explaining the daffodil bloom" },
    });
    fireEvent.change(dateAddedInput, {
      target: { value: "2024-12-12T05:06:05" },
    });
    fireEvent.click(createButton);

    //fireEvent.submit(screen.getByTestId("ArticleForm-title").closest("form"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Why are there so many daffodils in Jersey?",
      url: "https://www.bbc.com/news/articles/cx2l20rwxgxo",
      explanation: "Explaining the daffodil bloom",
      email: "prishabobde@gmail.com",
      dateAdded: "2024-12-12T05:06:05.000",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New article Created - id: 7 title: Why are there so many daffodils in Jersey?",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
  });
});
