import { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Switch,
  Input,
  Button,
  message,
  Space,
  Avatar,
  Typography,
} from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
import { useMarkAttendanceMutation } from "../store/api/tutorApi";

const { Text } = Typography;
const { TextArea } = Input;

export default function AttendanceModal({ visible, onClose, club, date }) {
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState("");
  const [markAttendance, { isLoading }] = useMarkAttendanceMutation();

  // Mock students data
  useEffect(() => {
    if (club) {
      setStudents([
        {
          _id: "1",
          full_name: "Aliyev Jasur",
          student_id_number: "123456",
          present: true,
          reason: "",
        },
        {
          _id: "2",
          full_name: "Karimova Dilnoza",
          student_id_number: "123457",
          present: true,
          reason: "",
        },
        {
          _id: "3",
          full_name: "Rashidov Azizbek",
          student_id_number: "123458",
          present: false,
          reason: "",
        },
        {
          _id: "4",
          full_name: "Umarova Gulnora",
          student_id_number: "123459",
          present: true,
          reason: "",
        },
        {
          _id: "5",
          full_name: "Saidov Bekzod",
          student_id_number: "123460",
          present: false,
          reason: "",
        },
      ]);
    }
  }, [club]);

  const handlePresenceChange = (studentId, present) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? { ...s, present, reason: present ? "" : s.reason }
          : s
      )
    );
  };

  const handleReasonChange = (studentId, reason) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, reason } : s))
    );
  };

  const handleSubmit = async () => {
    try {
      const attendanceData = {
        clubId: club._id,
        date: date.format("YYYY-MM-DD"),
        students: students.map((s) => ({
          student: s._id,
          present: s.present,
          reason: s.reason,
        })),
        notes,
      };

      await markAttendance(attendanceData).unwrap();
      message.success("Davomat muvaffaqiyatli saqlandi");
      onClose();
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-purple-500" />
          <div>
            <Text className="font-medium">{record.full_name}</Text>
            <Text className="block text-xs text-gray-500">
              {record.student_id_number}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Davomat",
      key: "attendance",
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.present}
          onChange={(checked) => handlePresenceChange(record._id, checked)}
          checkedChildren="Keldi"
          unCheckedChildren="Kelmadi"
        />
      ),
    },
    {
      title: "Kelmagan sababi",
      key: "reason",
      render: (_, record) => (
        <Input
          placeholder="Sabab kiriting..."
          value={record.reason}
          onChange={(e) => handleReasonChange(record._id, e.target.value)}
          disabled={record.present}
        />
      ),
    },
  ];

  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;
  const percentage =
    students.length > 0
      ? ((presentCount / students.length) * 100).toFixed(1)
      : 0;

  return (
    <Modal
      title={
        <div>
          <Text className="text-lg font-medium">Davomat kiritish</Text>
          <div className="text-sm text-gray-500 mt-1">
            {club?.name} - {date?.format("DD.MM.YYYY")}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <div key="stats" className="flex justify-between items-center w-full">
          <div className="flex gap-4">
            <Text>
              Kelgan:{" "}
              <span className="font-bold text-green-600">{presentCount}</span>
            </Text>
            <Text>
              Kelmagan:{" "}
              <span className="font-bold text-red-600">{absentCount}</span>
            </Text>
            <Text>
              Davomat:{" "}
              <span className="font-bold text-blue-600">{percentage}%</span>
            </Text>
          </div>
          <Space>
            <Button onClick={onClose}>Bekor qilish</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
            >
              Saqlash
            </Button>
          </Space>
        </div>,
      ]}
    >
      <div className="space-y-4">
        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          pagination={false}
          size="small"
        />

        <div>
          <Text className="block mb-2">Qo'shimcha izoh:</Text>
          <TextArea
            placeholder="Dars haqida izoh yoki eslatma..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}
