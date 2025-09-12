import { useState } from "react";
import {
  Card,
  Select,
  DatePicker,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  message,
  Modal,
  Input,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  LinkOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  useGetMyClubsQuery,
  useMarkAttendanceMutation,
  useAddTelegramPostMutation,
} from "../store/api/tutorApi";
import AttendanceModal from "../components/AttendanceModal";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function Attendance() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [telegramModal, setTelegramModal] = useState({
    visible: false,
    id: null,
  });
  const [telegramLink, setTelegramLink] = useState("");

  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const [markAttendance, { isLoading: marking }] = useMarkAttendanceMutation();
  const [addTelegramPost] = useAddTelegramPostMutation();

  const clubs = clubsData?.data || [];

  // Mock attendance data
  const attendanceData = [
    {
      _id: "1",
      date: "2024-12-20",
      students: [
        {
          student: { full_name: "Aliyev Jasur", student_id_number: "123456" },
          present: true,
        },
        {
          student: {
            full_name: "Karimova Dilnoza",
            student_id_number: "123457",
          },
          present: true,
        },
        {
          student: {
            full_name: "Rashidov Azizbek",
            student_id_number: "123458",
          },
          present: false,
          reason: "Kasal",
        },
      ],
      telegramPostLink: "https://t.me/channel/123",
    },
  ];

  const handleMarkAttendance = () => {
    if (!selectedClub) {
      message.warning("Avval to'garakni tanlang");
      return;
    }
    setAttendanceModal(true);
  };

  const handleAddTelegramLink = async () => {
    if (!telegramLink.trim()) {
      message.warning("Telegram linkini kiriting");
      return;
    }

    try {
      await addTelegramPost({
        id: telegramModal.id,
        telegramPostLink: telegramLink,
      }).unwrap();

      message.success("Telegram linki qo'shildi");
      setTelegramModal({ visible: false, id: null });
      setTelegramLink("");
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "Sana",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-purple-500" />
          <div>
            <Text className="font-medium">
              {dayjs(date).format("DD.MM.YYYY")}
            </Text>
            <Text className="block text-xs text-gray-500">
              {dayjs(date).format("dddd")}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Davomat",
      key: "attendance",
      render: (_, record) => {
        const total = record.students?.length || 0;
        const present = record.students?.filter((s) => s.present).length || 0;
        const absent = total - present;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return (
          <div className="space-y-2">
            <div className="flex gap-4">
              <Tag icon={<CheckCircleOutlined />} color="success">
                Kelgan: {present}
              </Tag>
              <Tag icon={<CloseCircleOutlined />} color="error">
                Kelmagan: {absent}
              </Tag>
            </div>
            <Text className="text-sm">Davomat: {percentage}%</Text>
          </div>
        );
      },
    },
    {
      title: "Studentlar",
      key: "students",
      render: (_, record) => (
        <div className="space-y-1">
          {record.students?.slice(0, 3).map((s, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  s.present ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="text-sm">{s.student.full_name}</Text>
              {s.reason && (
                <Tag color="orange" className="text-xs">
                  {s.reason}
                </Tag>
              )}
            </div>
          ))}
          {record.students?.length > 3 && (
            <Text className="text-xs text-gray-500">
              +{record.students.length - 3} ta
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Telegram",
      dataIndex: "telegramPostLink",
      key: "telegram",
      render: (link, record) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Button type="link" icon={<LinkOutlined />}>
              Post ko'rish
            </Button>
          </a>
        ) : (
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setTelegramModal({ visible: true, id: record._id })}
          >
            Link qo'shish
          </Button>
        ),
    },
  ];

  if (clubsLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Davomat</Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleMarkAttendance}
          size="large"
          className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
        >
          Davomat kiritish
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <div className="flex gap-4 mb-6">
          <Select
            placeholder="To'garakni tanlang"
            style={{ width: 250 }}
            value={selectedClub}
            onChange={setSelectedClub}
          >
            {clubs.map((club) => (
              <Select.Option key={club._id} value={club._id}>
                {club.name}
              </Select.Option>
            ))}
          </Select>

          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            format="DD.MM.YYYY"
            style={{ width: 150 }}
          />
        </div>

        {selectedClub ? (
          <Table
            columns={columns}
            dataSource={attendanceData}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Jami: ${total} ta`,
            }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CalendarOutlined className="text-4xl mb-4 text-gray-300" />
            <Text>To'garakni tanlang</Text>
          </div>
        )}
      </Card>

      <AttendanceModal
        visible={attendanceModal}
        onClose={() => setAttendanceModal(false)}
        club={clubs.find((c) => c._id === selectedClub)}
        date={selectedDate}
      />

      <Modal
        title="Telegram post linki"
        open={telegramModal.visible}
        onCancel={() => {
          setTelegramModal({ visible: false, id: null });
          setTelegramLink("");
        }}
        onOk={handleAddTelegramLink}
        okText="Qo'shish"
        cancelText="Bekor qilish"
      >
        <Input
          placeholder="https://t.me/channel/..."
          value={telegramLink}
          onChange={(e) => setTelegramLink(e.target.value)}
          prefix={<LinkOutlined />}
        />
      </Modal>
    </div>
  );
}
