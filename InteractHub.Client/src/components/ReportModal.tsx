import React, { useState } from "react";
import { AxiosError } from "axios";
import { postService } from "../services/postService";
import { toast } from "react-toastify";

interface ReportModalProps {
  postId: number;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam", icon: "🚫" },
  { id: "harassment", label: "Quấy rối", icon: "😤" },
  { id: "hate_speech", label: "Ngôn từ gây thù ghét", icon: "🗣️" },
  { id: "nude", label: "Ảnh khỏa thân", icon: "🔞" },
  { id: "violence", label: "Bạo lực", icon: "👊" },
  { id: "other", label: "Vấn đề khác", icon: "📝" },
];

const ReportModal: React.FC<ReportModalProps> = ({ postId, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Đưa ra component level để dùng được trong JSX
  const finalReason =
  selectedReason === "other"
    ? otherReason.trim()
    : otherReason.trim()
    ? `${selectedReason}: ${otherReason.trim()}`
    : selectedReason;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await postService.reportPost({
        postId,
        reason: finalReason ,
      });

      if (res.data.Success) {
        toast.success(res.data.Message);
        onClose();
      } else {
        toast.error(res.data.Message);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.Message ?? "Gửi báo cáo thất bại.");
      } else {
        toast.error("Gửi báo cáo thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#242526] w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-[#3e4042] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3e4042]">
          <button
            onClick={step === 2 ? () => setStep(1) : onClose}
            className="p-2 hover:bg-[#3a3b3c] rounded-full text-gray-400"
          >
            {step === 2 ? "⬅️" : "✕"}
          </button>
          <h3 className="text-lg font-bold text-white">Báo cáo bài viết</h3>
          <div className="w-10" />
        </div>

        {/* Body */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {step === 1 ? (
            <>
              <p className="px-3 py-2 text-[#b0b3b8] text-sm font-medium">
                Vui lòng chọn vấn đề để tiếp tục
              </p>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => {
                    setSelectedReason(reason.label);
                    setStep(2);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#3a3b3c] rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{reason.icon}</span>
                    <span className="text-white font-medium">{reason.label}</span>
                  </div>
                  <span className="text-gray-500 group-hover:text-white">➡️</span>
                </button>
              ))}
            </>
          ) : (
            <div className="p-3">
              <p className="text-white mb-2">
                Bạn đang báo cáo vì lý do:{" "}
                <span className="font-bold text-[#1877f2]">{selectedReason}</span>
              </p>
              <textarea
                autoFocus
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Nhập chi tiết thêm (không bắt buộc)..."
                className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#1877f2] h-24"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="p-4 border-t border-[#3e4042] flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-white font-bold rounded-lg"
            >
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || finalReason.length === 0} // ✅ đã trim() rồi nên không cần gọi lại
              className="flex-1 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold rounded-lg disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;