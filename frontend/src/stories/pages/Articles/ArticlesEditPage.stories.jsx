import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ArticleEditPage from "main/pages/Articles/ArticlesEditPage";
import { articleFixtures } from "fixtures/articleFixtures";

export default {
  title: "pages/Articles/ArticleEditPage",
  component: ArticleEditPage,
};

const Template = () => <ArticleEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/articles", () => {
      return HttpResponse.json(articleFixtures.threeArticles[0], {
        status: 200,
      });
    }),
    http.put("/api/articles", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
    http.put("/api/articles", (req) => {
      window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json(
        {
          id: 17,
          title: "Why are there so many daffodils in Jersey? EDITED",
          url: "https://www.bbc.com/news/articles/cx2l20rwxgxo/edited",
          explanation: "Explaining the daffodil bloom EDITED",
          email: "prishabobdeEDITED@gmail.com",
          dateAdded: "2024-11-12T05:06",
        },
        { status: 200 },
      );
    }),
  ],
};
