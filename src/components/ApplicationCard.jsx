import { Card, Avatar, Button, Tag, Space, Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function ApplicationCard({
  application,
  onApprove,
  onReject,
  processing,
}) {
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
    <Card
      className="shadow-md border-0 hover:shadow-lg transition-shadow"
      actions={
        status === "pending"
          ? [
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => onApprove(application._id)}
                loading={processing}
                className="bg-green-500 border-0"
              >
                Qabul qilish
              </Button>,
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => onReject(application._id)}
                loading={processing}
              >
                Rad etish
              </Button>,
            ]
          : null
      }
    >
      <div className="space-y-4">
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
            </div>
          </div>
          <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOutlined />
            <Text className="text-sm">To'garak: {club?.name}</Text>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <UserOutlined />
            <Text className="text-sm">Guruh: {student?.group?.name}</Text>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <CalendarOutlined />
            <Text className="text-sm">
              Ariza sanasi: {dayjs(applicationDate).format("DD.MM.YYYY HH:mm")}
            </Text>
          </div>
        </div>

        {status === "rejected" && rejectionReason && (
          <div className="p-3 bg-red-50 rounded-lg">
            <Text className="text-red-600 text-sm">
              <strong>Rad etish sababi:</strong> {rejectionReason}
            </Text>
          </div>
        )}

        {student?.department && (
          <div className="pt-2 border-t">
            <Tag color="blue">{student.department.name}</Tag>
            <Tag>{student.level?.name}</Tag>
          </div>
        )}
      </div>
    </Card>
  );
}
