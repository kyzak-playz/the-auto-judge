"use client";
import React, { use, useEffect } from 'react'
import CodeMirrorComponent from '@/components/problem/CodeMirrorComponent'
import { Button } from "@/components/ui/button"
import { ProblemDetail } from '@/types/problem-types'

// page props
type PageProps = {
  params: Promise<{ problemid: string }>;
}

// Define the API endpoint and request options
// 
// Currently, the endpoint is hardcoded and Fetch logic is used for mock based data
// It will be replaced with useClientFetch hook once the backend is ready and integrated with the frontend
// Remove all manual states and simply use the custom hook and use it's runFetch function isntead of fetch api call
// and leave the rest of the code as is. The custom hook will handle all the states and return the data, loading and error states
const endpoint: RequestInfo = `http://localhost:3000/api/v1/problem/`;
const init: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const Page = ({ params }: PageProps) => {
  const { problemid } = use(params);
  const [data, setData] = React.useState<ProblemDetail | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    // Fetch problem details when the component mounts
    const fetchProblemDetails = async () => {
      try {
        const response = await fetch(`${endpoint}?id=${problemid}`, init);
        if (!response.ok) {
          setError(new Error(`Error fetching problem details: ${response.statusText}`));
          setLoading(false);
          return;
        }
        const problemData = await response.json();
        setData(problemData);
        console.log(problemData)
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen gap-4 mx-8 mt-20 text-center m-10">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen gap-4 mx-8 mt-20">Error: {error.message}</div>;
  }

  if (!data) {
    return <div className="flex min-h-screen gap-4 mx-8 mt-20">No problem details available.</div>;
  }

  return (
    <>
      <div className="flex min-h-screen gap-4 mx-8 mt-20">
        {/* Problem Description */}
        <section className="w-1/2 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-zinc-100">
          <div className="text-3xl font-bold">{data.title}</div>
          <div className="mt-4">{data.description}</div>
        </section>

        {/* Editor */}
        <section className="w-1/2 overflow-y-auto">
          <CodeMirrorComponent />
        </section>
      </div>
      <div className="flex justify-center items-center my-4">
        <Button className="px-10 hover:cursor-pointer">
          Submit
        </Button>
      </div>
    </>
  )
}

export default Page