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
  Avatar,
  Tag,
  Skeleton,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  useGetApplicationsQuery,
  useProcessApplicationMutation,
} from "../store/api/tutorApi";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Application List Item Component
const ApplicationListItem = ({
  application,
  onApprove,
  onReject,
  processing,
}) => {
  const { student, club, status, applicationDate, rejectionReason } =
    application;

  const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "error",
  };

  const statusTexts = {
    pending: "Kutilmoqda",
    approved: "Qabul qilingan",
    rejected: "Rad etilgan",
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Student Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={student?.image}
              icon={!student?.image && <UserOutlined />}
              size="large"
              className="bg-purple-500"
            />
            <div>
              <Text className="font-medium block">{student?.full_name}</Text>
              <Text className="text-xs text-gray-500">
                {student?.student_id_number}
              </Text>
              <Tag color="blue" className="mt-1" size="small">
                {student?.group?.name}
              </Tag>
            </div>
          </div>
          <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
        </div>

        {/* Club and Date Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOutlined className="text-sm" />
            <Text className="text-sm">To'garak: {club?.name}</Text>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <CalendarOutlined className="text-sm" />
            <Text className="text-sm">
              {dayjs(applicationDate).format("DD.MM.YYYY HH:mm")}
            </Text>
          </div>
        </div>

        {/* Department Info */}
        {student?.department && (
          <div className="pt-2 border-t">
            <Tag color="purple">{student.department.name}</Tag>
          </div>
        )}

        {/* Rejection Reason */}
        {status === "rejected" && rejectionReason && (
          <div className="p-3 bg-red-50 rounded-lg">
            <Text className="text-red-600 text-sm">
              <strong>Rad etish sababi:</strong> {rejectionReason}
            </Text>
          </div>
        )}

        {/* Action Buttons for Pending */}
        {status === "pending" && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApprove(application._id)}
              loading={processing}
              className="flex-1 bg-green-500 border-0"
            >
              Qabul qilish
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => onReject(application._id)}
              loading={processing}
              className="flex-1"
            >
              Rad etish
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function Applications() {
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  // Real API calls
  const { data, isLoading, refetch } = useGetApplicationsQuery(activeTab);
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
        refetch(); // Refresh the list
      }
    } catch (error) {
      message.error(error?.data?.message || "Xatolik yuz berdi");
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
        refetch(); // Refresh the list
      }
    } catch (error) {
      message.error(error?.data?.message || "Xatolik yuz berdi");
    }
  };

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Title level={3}>Arizalar</Title>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Title level={3}>Arizalar</Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          refetch(); // Fetch new data when tab changes
        }}
        className="custom-tabs"
      >
        <TabPane tab={<span>Kutilayotgan</span>} key="pending" />
        <TabPane tab={<span>Qabul qilingan</span>} key="approved" />
        <TabPane tab={<span>Rad etilgan</span>} key="rejected" />
      </Tabs>

      {applications.length > 0 ? (
        <div className="max-w-3xl mx-auto">
          {applications.map((application) => (
            <ApplicationListItem
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
