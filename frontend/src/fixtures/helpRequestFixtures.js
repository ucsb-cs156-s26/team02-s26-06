const helpRequestFixtures = {
  oneHelpRequest: {
    "id": 1,
    "requesterEmail": "cgaucho@ucsb.edu",
    "teamId": "team-02",
    "tableOrBreakoutRoom": "2",
    "requestTime": "2026-05-02T05:05:23",
    "explanation": "Help with dokku deployment",
    "solved": false,
  },
  threeHelpRequest: [
    {
        "id": 1,
        "requesterEmail": "cgaucho@ucsb.edu",
        "teamId": "team-02",
        "tableOrBreakoutRoom": "2",
        "requestTime": "2026-05-02T05:05:23",
        "explanation": "Help with dokku deployment",
        "solved": false
    },
    {
        "id": 2,
        "requesterEmail": "storkie@ucsb.edu",
        "teamId": "team-06",
        "tableOrBreakoutRoom": "6",
        "requestTime": "2026-05-02T06:25:23",
        "explanation": "Help with setting up with controller",
        "solved": true
    },
    {
        "id": 4,
        "requesterEmail": "phelps@ucsb.edu",
        "teamId": "team-12",
        "tableOrBreakoutRoom": "12",
        "requestTime": "2026-05-02T03:15:26",
        "explanation": "Need to resolve merge conflict",
        "solved": false
    }
  ],
};

export { helpRequestFixtures };
