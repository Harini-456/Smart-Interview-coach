export default function QuestionCard({ question, index, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-5">
      <h2 className="font-semibold text-lg mb-4">
        Q{index + 1}. {question.question}
      </h2>

      <textarea
        className="w-full border rounded-xl p-4 outline-none"
        rows="4"
        placeholder="Type your answer here..."
        onChange={(e) => onChange(index, e.target.value)}
      />
    </div>
  );
}