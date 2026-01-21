// import { useNavigate } from "react-router-dom";

function AcceptQuestionPage() {
    // const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <h1 className="text-xl font-semibold">Tejas</h1>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Back */}
                <button
                    // onClick={() => navigate(-1)}
                    className="flex items-center text-sm text-gray-600 hover:text-black mb-6"
                >
                    ← Back to Questions
                </button>

                {/* Card */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-1">subj1</h2>
                    <p className="text-sm text-gray-500 mb-4">Posted 2 months ago</p>

                    <p className="text-gray-700 mb-6">
                        hbyu ytyf fyfyfrdrdrtdrdrdy u yg d
                    </p>


                    <p className="text-gray-600 mb-4">
                        You can help with this question.
                    </p>

                    <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
                        Accept Question & Start Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AcceptQuestionPage;