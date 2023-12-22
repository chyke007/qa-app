import { useEffect, useState } from "react";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface FormElements extends HTMLFormControlsCollection {
  message: HTMLInputElement;
}
interface QAFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function Home() {
  const [isloading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (event: React.FormEvent<QAFormElement>) => {
    event.preventDefault();

    const question = event.currentTarget.question.value;
    if (!question) {
      alert("Please enter question");
      return;
    }

    setIsLoading(true);
    setAnswer("Loading Answer...");

    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data.error) {
          alert(data.error);
          return;
        }
        setAnswer(data?.completion || "An error occured");
      });
  };

  const clearForm = () => {
    setQuestion("");
    setAnswer("");
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen p-8 ${inter.className}`}
    >
      <h1 className="text-xl font-bold p-2 m-2"> Q&A app</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <textarea
            id="question"
            rows={2}
            cols={15}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Write your thoughts here..."
            value={question}
            onChange={handleQuestionChange}
          ></textarea>
        </div>
        <div className="mb-4">
          <textarea
            id="answer"
            rows={10}
            cols={60}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Answer would be displayed here..."
            value={answer}
            onChange={handleAnswerChange}
            disabled
          ></textarea>
        </div>
        <div className="flex flex-col m-2 w-full">
          <button
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isloading}
          >
            {isloading ? "Loading..." : "Send"}
          </button>
          <button
            className="w-full bg-black hover:bg-gray-400 text-white font-bold my-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={clearForm}
          >
            Clear
          </button>
        </div>
      </form>
    </main>
  );
}
