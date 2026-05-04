const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 2,
    requesterEmail: "dongyi_xia@uscb.edu",
    professorEmail: "pconrad@cs.ucsb.edu",
    explanation: "BSMS",
    dateRequested: "2026-01-01T08:00:00",
    dateNeeded: "2026-05-01T08:00:00",
    done: false,
  },
  threeRecommendationRequests: [
    {
      id: 2,
      requesterEmail: "dongyi_xia@uscb.edu",
      professorEmail: "pconrad@cs.ucsb.edu",
      explanation: "BSMS",
      dateRequested: "2026-01-01T08:00:00",
      dateNeeded: "2026-05-01T08:00:00",
      done: false,
    },
    {
      id: 3,
      requesterEmail: "julie_wang@uscb.edu",
      professorEmail: "pconrad@cs.ucsb.edu",
      explanation: "BSMS",
      dateRequested: "2026-03-03T08:00:00",
      dateNeeded: "2026-05-01T08:00:00",
      done: false,
    },
    {
      id: 4,
      requesterEmail: "sarah_smiths@uscb.edu",
      professorEmail: "pconrad@cs.ucsb.edu",
      explanation: "BSMS",
      dateRequested: "2026-03-03T08:00:00",
      dateNeeded: "2026-07-01T08:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
