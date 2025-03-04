import { useState } from "react";

const Editor = () => {
  const [content, setContent] = useState([]); // Stores all elements
  const [editingIndex, setEditingIndex] = useState(null); // Index of item being edited
  const [tempText, setTempText] = useState(""); // Temporary text while editing

  const addElement = (type) => {
    setContent([...content, { type, text: type === "code" ? "Enter code..." : "Click to edit..." }]);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setTempText(content[index].text);
  };

  const saveChanges = () => {
    const updatedContent = [...content];
    updatedContent[editingIndex].text = tempText;

    setContent(updatedContent);
    setEditingIndex(null); // Close the popup
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Rich Text Editor</h2>

      {/* Buttons to add elements */}
      <div className="mb-4">
        <button onClick={() => addElement("heading")} className="px-2 py-1 border rounded mr-2">Add Heading</button>
        <button onClick={() => addElement("text")} className="px-2 py-1 border rounded mr-2">Add Text</button>
        <button onClick={() => addElement("code")} className="px-2 py-1 border rounded">Add Code</button>
      </div>

      {/* Render Content Elements */}
      {content.map((item, index) => (
        <div key={index} onClick={() => startEditing(index)} className="cursor-pointer mb-2 p-2 border rounded">
          {item.type === "heading" && <h1>{item.text}</h1>}
          {item.type === "text" && <p>{item.text}</p>}
          {item.type === "code" && <code className="bg-gray-100 p-1 rounded">{item.text}</code>}
        </div>
      ))}

      {/* Editing Popup */}
      {editingIndex !== null && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-2">Edit Content</h3>
            <textarea
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              className="w-full p-2 border rounded"
              rows="4"
            />
            <div className="mt-2 flex justify-end">
              <button onClick={saveChanges} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
