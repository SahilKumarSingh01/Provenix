import React from "react";
// import VideoUpload from "../components/VideoUpload";

import MCQCard from "../components/MCQCard"; // Make sure path sahi ho


import Reviews from "../components/Reviews"; 

import CodeToggle from "../components/CodeToggle";

import CodeBox from "../components/CodeBox"; 

import CourseCard from "../components/CourseCard"; 

import ListSection from "../pages/ListSection"; // Adjust path if needed

import CoursesList from "../pages/CourseList"; // Adjust path if needed






import ImageUpload from "../components/ImageUpload";

const Explore = () => {
  const sampleMCQ = {
    question: "What is 2 + 2?",
    options: ["1", "2", "4", "5"],
    correctAnswer: 2, // Index of correct answer
};

const sampleCode = `
function add(a, b) {
    return a + b;
}
console.log(add(2, 3));
`;
const codeData = [
  { lang: "JavaScript", data: "console.log('Hello, World!');\nlet x = 10;" },
  { lang: "Python", data: "print('Hello, World!')\nx = 10" },
];

const courseData = {
  title: "React for Beginners",
  creator: "John Doe",
  students: 1200,
  category: "Web Development",
  price: 19.99,
  rating: 4.8,
  thumbnail: "", // Agar koi custom thumbnail nahi hai toh default use hoga
};

  return (
    <div>
      <h1>Explore Page</h1>
      {/* <VideoUpload /> */}
      <Reviews />
      <MCQCard {...sampleMCQ} />
      <CodeToggle codeSnippet={sampleCode} language="javascript" />
      <CodeBox codeData={codeData} />
      <CourseCard course={courseData} />
      <ListSection />
      <CoursesList />





      <ImageUpload />
    </div>
  );
};

export default Explore;
