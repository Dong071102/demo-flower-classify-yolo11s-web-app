import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [flowerInfo, setFlowerInfo] = useState<any>(null);

  interface Prediction {
    class: string;
    confidence: number;
    class_id: string;
  }

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setImageUrl(e.target.value);
  };

  const handleFileUpload = async () => {
    if (!file) return setError("Please select an image file.");

    const formData = new FormData();
    formData.append("file", file);
    console.log(formData);

    try {
      const response = await axios.post("http://localhost:8000/predict_image_file/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPredictions(response.data.top5_predictions);
      console.log(response.data.top5_predictions);
      setError("");
    } catch (err) {
      setError("Failed to get predictions for file upload.");
    }
  };

  const handleUrlSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/predict_url/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!response.ok) throw new Error("Prediction failed");
      const data = await response.json();
      console.log(data);
      setPredictions(data.top5_predictions);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to get predictions for URL.");
    }
  };

  const handleFlowerButtonClick = async (flowerClass: string) => {
    try {
      const response = await fetch("http://localhost:8000/flower_info/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flower_class: flowerClass }),
      });
      if (!response.ok) throw new Error("Failed to get flower info");
      const data = await response.json();
      setFlowerInfo(data);
      console.log(data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to get flower info.");
    }
  };
  const vietnameseLabels: { [key: string]: string } = {
    name: "Tên",
    appearance: "Ngoại hình",
    fragrance: "Hương thơm",
    growthCycle: "Chu kỳ sinh trưởng",
    habitatAndDistribution: "Môi trường và phân bố",
    symbolismAndUses: "Biểu tượng và công dụng",
    biologicalCharacteristics: "Đặc điểm sinh học",
    sampleImageUrl: "Ảnh mẫu",
    commonName: "Tên thường gọi",
    scientificName: "Tên khoa học",
    localName: "Tên địa phương",
    size: "Kích thước",
    petal: "Cánh hoa",
    stamen: "Nhụy hoa",
    leaf: "Lá",
    stem: "Thân",
    level: "Mức độ",
    type: "Loại",
    bloomingSeason: "Mùa nở hoa",
    bloomDuration: "Thời gian nở hoa",
    lifespan: "Tuổi thọ",
    origin: "Nguồn gốc",
    preferredEnvironment: "Môi trường ưa thích",
    adaptability: "Khả năng thích nghi",
    culturalSymbolism: "Biểu tượng văn hóa",
    uses: "Công dụng",
    pollination: "Thụ phấn",
    hybridizationAbility: "Khả năng lai tạo",
    shape: "Hình dạng",
    count: "Số lượng",
    color: "Màu sắc",
    texture: "Đặc tính",
    features: "Đặc điểm",
  };

  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === "string" && item.startsWith("http") ? (
                <a
                  href={item}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {item}
                </a>
              ) : (
                renderValue(item)
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object" && value !== null) {
      return (
        <table className="min-w-full border border-gray-300 my-1">
          <tbody>
            {Object.entries(value).map(([k, v]) => {
              const label = vietnameseLabels[k] || k;
              return (
                <tr key={k}>
                  <td className="border px-2 py-1 font-medium bg-gray-100">{label}</td>
                  <td className="border px-2 py-1">{renderValue(v)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    return value?.toString();
  };

  const renderFlowerInfoTable = () => {
    return (
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left bg-gray-200">Thuộc tính</th>
            <th className="border px-2 py-1 text-left bg-gray-200">Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(flowerInfo).map(([key, value]) => {
            const label = vietnameseLabels[key] || key;
            return (
              <tr key={key}>
                <td className="border px-2 py-1 font-semibold">{label}</td>
                <td className="border px-2 py-1">{renderValue(value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">YOLOv11 small flower prediction app</h1>
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <div className="  border-solid border-2 border-gray-300 rounded-md p-3">
          <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-900 
      file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700
      hover:file:bg-blue-100 
      mb-2"/>
          <button
            onClick={handleFileUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl w-full hover:bg-blue-600"
          >
            Predict from File
          </button>
        </div>
        <span className="block text-center my-4">or</span>
        <div className="mb-4  border-solid border-2 border-gray-300 rounded-md p-3">
          <input
            type="text"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={handleUrlChange}
            onClick={() => handleUrlSubmit()}
            className="w-full px-4 py-2 border border-gray-300 rounded-md
      focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            onClick={handleUrlSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-xl w-full hover:bg-green-600"
          >
            Predict from URL
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {predictions.map((pred, index) => {
          const confidencePercentage = (pred.confidence * 100).toFixed(2);
          // Skip rendering if confidence is 0.00%
          if (confidencePercentage === "0.00") return null;

          // Define colors for top 1 to 5 predictions.
          const colors = [
            "bg-green-200", // Top 1
            "bg-blue-200",  // Top 2
            "bg-yellow-200",// Top 3
            "bg-purple-200",// Top 4
            "bg-red-200"    // Top 5
          ];
          const bgColor = colors[index] || "bg-gray-100"; // Fallback if more than 5

          return (
            <button
              key={index}
              onClick={() => handleFlowerButtonClick(pred.class_id)}
              className={`text-gray-700 border px-2 py-1 rounded hover:bg-gray-100 ${bgColor}`}
            >
              {pred.class}: {confidencePercentage}%
            </button>
          );
        })}
      </div>

      {flowerInfo && (
        <div className="fixed inset-0 flex  items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-full overflow-auto">
            <h2 className="text-3xl font-bold mb-4">
              {flowerInfo.name?.commonName || "Flower Information"}
            </h2>
            {renderFlowerInfoTable()}
            <button
              onClick={() => setFlowerInfo(null)}
              className="mt-6 bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;