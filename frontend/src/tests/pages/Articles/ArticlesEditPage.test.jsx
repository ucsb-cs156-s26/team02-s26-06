import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("Article-title")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Why are there so many daffodils in Jersey?",
        url: "https://www.bbc.com/news/articles/cx2l20rwxgxo",
        explanation: "Explaining the daffodil bloom",
        email: "prishabobde@gmail.com",
        dateAdded: "2024-12-12T05:06",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        title: "Why are there so many daffodils in Jersey? EDITED",
        url: "https://www.bbc.com/news/articles/cx2l20rwxgxo/edited",
        explanation: "Explaining the daffodil bloom EDITED",
        email: "prishabobdeEDITED@gmail.com",
        dateAdded: "2024-11-12T05:06:05",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");

      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByLabelText("Url");
      const explanationField = screen.getByLabelText("Explanation");
      const emailField = screen.getByLabelText("Email");
      const dateAddedField = screen.getByLabelText("Date Added(iso format)");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue(
        "Why are there so many daffodils in Jersey?",
      );

      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://www.bbc.com/news/articles/cx2l20rwxgxo",
      );

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("Explaining the daffodil bloom");

      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("prishabobde@gmail.com");

      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2024-12-12T05:06");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "Why are there so many daffodils in Jersey? EDITED" },
      });
      fireEvent.change(urlField, {
        target: {
          value: "https://www.bbc.com/news/articles/cx2l20rwxgxo/edited",
        },
      });
      fireEvent.change(explanationField, {
        target: { value: "Explaining the daffodil bloom EDITED" },
      });
      fireEvent.change(emailField, {
        target: { value: "prishabobdeEDITED@gmail.com" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2024-11-12T05:06" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Article Updated - id: 17 title: Why are there so many daffodils in Jersey? EDITED",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Why are there so many daffodils in Jersey? EDITED",
          url: "https://www.bbc.com/news/articles/cx2l20rwxgxo/edited",
          explanation: "Explaining the daffodil bloom EDITED",
          email: "prishabobdeEDITED@gmail.com",
          dateAdded: "2024-11-12T05:06",
        }),
      ); // posted object
    });
  });
});
