import { useState } from "react";
import {
  Card,
  Tabs,
  Badge,
  Empty,
  Button,
  message,
  Modal,
  Input,
  Typography,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  useGetApplicationsQuery,
  useProcessApplicationMutation,
} from "../store/api/tutorApi";
import ApplicationCard from "../components/ApplicationCard";
import LoadingSpinner from "../components/LoadingSpinner";

const { TabPane } = Tabs;
const { Title } = Typography;
const { TextArea } = Input;

export default function Applications() {
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useGetApplicationsQuery(activeTab);
  const [processApplication, { isLoading: processing }] =
    useProcessApplicationMutation();

  const applications = data?.data || [];

  const handleApprove = async (id) => {
    try {
      const result = await processApplication({
        id,
        action: "approve",
      }).unwrap();

      if (result.success) {
        message.success("Ariza qabul qilindi");
      }
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Rad etish sababini kiriting");
      return;
    }

    try {
      const result = await processApplication({
        id: rejectModal.id,
        action: "reject",
        rejectionReason: rejectReason,
      }).unwrap();

      if (result.success) {
        message.success("Ariza rad etildi");
        setRejectModal({ visible: false, id: null });
        setRejectReason("");
      }
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (isLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-6">
      <Title level={3}>Arizalar</Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
      >
        <TabPane
          tab={
            <span>
              Kutilayotgan
              {counts.pending > 0 && (
                <Badge count={counts.pending} className="ml-2" />
              )}
            </span>
          }
          key="pending"
        />
        <TabPane
          tab={
            <span>
              Qabul qilingan
              <Badge
                count={counts.approved}
                showZero
                className="ml-2 bg-green-500"
              />
            </span>
          }
          key="approved"
        />
        <TabPane
          tab={
            <span>
              Rad etilgan
              <Badge
                count={counts.rejected}
                showZero
                className="ml-2 bg-red-500"
              />
            </span>
          }
          key="rejected"
        />
      </Tabs>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onApprove={handleApprove}
              onReject={(id) => setRejectModal({ visible: true, id })}
              processing={processing}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Empty
            description={
              activeTab === "pending"
                ? "Kutilayotgan arizalar yo'q"
                : activeTab === "approved"
                ? "Qabul qilingan arizalar yo'q"
                : "Rad etilgan arizalar yo'q"
            }
          />
        </Card>
      )}

      <Modal
        title="Arizani rad etish"
        open={rejectModal.visible}
        onCancel={() => {
          setRejectModal({ visible: false, id: null });
          setRejectReason("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRejectModal({ visible: false, id: null });
              setRejectReason("");
            }}
          >
            Bekor qilish
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            loading={processing}
            onClick={handleReject}
            icon={<CloseOutlined />}
          >
            Rad etish
          </Button>,
        ]}
      >
        <TextArea
          placeholder="Rad etish sababini kiriting..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          className="mt-4"
        />
      </Modal>
    </div>
  );
}
