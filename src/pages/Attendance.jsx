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
  Drawer,
  List,
  Tag,
  Skeleton,
} from "antd";
import { UserOutlined, SaveOutlined, SearchOutlined } from "@ant-design/icons";
import { useMarkAttendanceMutation } from "../store/api/tutorApi";
import { useGetClubStudentsQuery } from "../store/api/clubApi";

const { Text } = Typography;
const { TextArea } = Input;

export default function AttendanceModal({ visible, onClose, club, date }) {
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState("");
  const [searchText, setSearchText] = useState("");
  const [markAttendance, { isLoading: marking }] = useMarkAttendanceMutation();

  // Fetch real students data
  const { data: studentsData, isLoading: studentsLoading } =
    useGetClubStudentsQuery(club?._id, { skip: !club?._id });

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (studentsData?.data) {
      // Initialize attendance data with real students
      setStudents(
        studentsData.data.map((student) => ({
          _id: student._id,
          full_name: student.full_name,
          student_id_number: student.student_id_number,
          group: student.group,
          department: student.department,
          image: student.image,
          present: true,
          reason: "",
        }))
      );
    }
  }, [studentsData]);

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
      setNotes("");
      setSearchText("");
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.student_id_number.includes(searchText)
  );

  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;
  const percentage =
    students.length > 0
      ? ((presentCount / students.length) * 100).toFixed(1)
      : 0;

  // Desktop table columns
  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            className="bg-purple-500"
          />
          <div>
            <Text className="font-medium">{record.full_name}</Text>
            <Text className="block text-xs text-gray-500">
              {record.student_id_number}
            </Text>
            {record.group && (
              <Text className="block text-xs text-gray-400">
                {record.group.name}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Davomat",
      key: "attendance",
      width: 120,
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

  // Mobile list item
  const MobileStudentItem = ({ student }) => (
    <List.Item className="border-b py-3">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar
              src={student.image}
              icon={!student.image && <UserOutlined />}
              className="bg-purple-500"
              size="large"
            />
            <div className="flex-1">
              <Text className="font-medium block">{student.full_name}</Text>
              <Text className="text-xs text-gray-500">
                {student.student_id_number}
              </Text>
              {student.group && (
                <Tag size="small" color="blue" className="mt-1">
                  {student.group.name}
                </Tag>
              )}
            </div>
          </div>
          <Switch
            checked={student.present}
            onChange={(checked) => handlePresenceChange(student._id, checked)}
            checkedChildren="Keldi"
            unCheckedChildren="Yo'q"
          />
        </div>
        {!student.present && (
          <Input
            placeholder="Kelmagan sababi..."
            value={student.reason}
            onChange={(e) => handleReasonChange(student._id, e.target.value)}
            size="small"
          />
        )}
      </div>
    </List.Item>
  );

  const content = (
    <>
      <div className="mb-4">
        <Input
          placeholder="Student qidirish..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4"
        />
      </div>

      {studentsLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : isMobile ? (
        <List
          dataSource={filteredStudents}
          renderItem={(student) => <MobileStudentItem student={student} />}
          className="max-h-96 overflow-y-auto"
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="_id"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      )}

      <div className="mt-4 space-y-4">
        <div>
          <Text className="block mb-2">Qo'shimcha izoh:</Text>
          <TextArea
            placeholder="Dars haqida izoh yoki eslatma..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <Tag color="green" className="m-0">
            Kelgan: <span className="font-bold">{presentCount}</span>
          </Tag>
          <Tag color="red" className="m-0">
            Kelmagan: <span className="font-bold">{absentCount}</span>
          </Tag>
          <Tag color="blue" className="m-0">
            Davomat: <span className="font-bold">{percentage}%</span>
          </Tag>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex justify-end gap-2">
      <Button onClick={onClose}>Bekor qilish</Button>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={handleSubmit}
        loading={marking}
        className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
      >
        Saqlash
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        title={
          <div>
            <Text className="text-lg font-medium">Davomat kiritish</Text>
            <div className="text-sm text-gray-500 mt-1">
              {club?.name} - {date?.format("DD.MM.YYYY")}
            </div>
          </div>
        }
        placement="bottom"
        open={visible}
        onClose={onClose}
        height="90%"
        footer={footer}
      >
        {content}
      </Drawer>
    );
  }

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
      footer={footer}
    >
      {content}
    </Modal>
  );
}
