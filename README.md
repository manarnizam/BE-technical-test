# PrepX Backend Technical Test

## About PrepX
PrepX is a robust Learning Management System (LMS) designed to empower dental students in their preparation for professional examinations. Our platform provides a comprehensive suite of tools to create, manage, and deliver online exams, ensuring an efficient and engaging learning experience. At PrepX, we prioritize scalability, reliability, and real-time functionality to support our users effectively. As part of our ongoing efforts to enhance the platform, we are seeking skilled backend developers to contribute to the development of critical features.

## Task Description
For this technical test, your task is to implement a real-time timer synchronization feature for one of our online exams. The feature requires the following:

- **API Development**: Design and implement a backend API to manage a timer for an online exam. The timer must be synchronized across all students participating in the exam. The API should include endpoints to:
  - Start, pause, and reset the timer for an exam.
  - Allow a trainee (instructor) to add or subtract time for either all students or specific individuals during the exam.
  - Ensure all updates to the timer are reflected in real-time for all connected clients.
- **Client Implementation**: Create a simple webpage that displays the synchronized timer and reflects any updates (e.g., time added or subtracted) in real-time. The webpage should serve as a client to validate your API implementation.
- **Validation**: Ensure the solution is robust, handles edge cases (e.g., network disruptions, concurrent updates), and maintains data consistency across clients.

## Technical Requirements
- Use a backend framework of your choice, ensuring the solution is scalable and follows RESTful principles where applicable.
- Include clear documentation on how to set up and run both the backend API and the client webpage.
- Ensure the solution includes basic error handling and validation.

## Submission Instructions
1. Fork the provided repository at [this repo](https://github.com/hghazi-prepx/BE-technical-test).
2. Implement the feature as described, including both the backend API and the client webpage.
3. Include a README file with:
   - Instructions to set up and run the backend and client.
   - A brief explanation of your technical choices.
   - Any assumptions made during implementation.
4. Create a pull request to the test repository with your changes.

## Evaluation Criteria
Your submission will be evaluated based on:
- Correctness and functionality of the timer synchronization feature.
- Code quality, including adherence to best practices, modularity, and readability.
- Robustness of the solution and handling of edge cases.
- Clarity and completeness of documentation.
- Efficiency and scalability of the solution.

We look forward to reviewing your implementation. Best of luck!
