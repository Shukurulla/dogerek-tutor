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
  Empty,
  Alert,
  Card,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useMarkAttendanceMutation,
  useGetAttendanceByDateQuery,
} from "../store/api/tutorApi";
import { useGetClubStudentsQuery } from "../store/api/clubApi";

const { Text } = Typography;
const { TextArea } = Input;

export default function AttendanceModal({ visible, onClose, club, date }) {
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState("");
  const [searchText, setSearchText] = useState("");
  const [telegramPostLink, setTelegramPostLink] = useState("");

  const isMobile = window.innerWidth < 768;

  // Real API chaqiriqlari
  const { data: studentsData, isLoading: studentsLoading } =
    useGetClubStudentsQuery(club?._id, { skip: !club?._id });

  const { data: existingAttendance } = useGetAttendanceByDateQuery(
    {
      date: date?.format("YYYY-MM-DD"),
      clubId: club?._id,
    },
    { skip: !club?._id || !date }
  );

  const [markAttendance, { isLoading: marking }] = useMarkAttendanceMutation();

  // Students ma'lumotlarini yuklab, state ga saqlash
  useEffect(() => {
    if (studentsData?.data && visible) {
      const studentsWithAttendance = studentsData.data.map((student) => {
        // Agar bu sana uchun davomat mavjud bo'lsa, oldingi ma'lumotlarni yuklash
        const existingRecord = existingAttendance?.data?.students?.find(
          (s) => s.student._id === student._id || s.student === student._id
        );

        return {
          _id: student._id,
          full_name: student.full_name,
          student_id_number: student.student_id_number,
          group: student.group,
          department: student.department,
          image: student.image,
          present: existingRecord ? existingRecord.present : true, // Default true
          reason: existingRecord ? existingRecord.reason : "",
        };
      });

      setStudents(studentsWithAttendance);

      // Agar mavjud davomat bo'lsa, notes va telegram link ni ham yuklash
      if (existingAttendance?.data) {
        setNotes(existingAttendance.data.notes || "");
        setTelegramPostLink(existingAttendance.data.telegramPostLink || "");
      } else {
        setNotes("");
        setTelegramPostLink("");
      }
    }
  }, [studentsData, existingAttendance, visible]);

  // Modal yopilganda state ni tozalash
  useEffect(() => {
    if (!visible) {
      setStudents([]);
      setNotes("");
      setTelegramPostLink("");
      setSearchText("");
    }
  }, [visible]);

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
    if (!club || !date) {
      message.error("To'garak yoki sana tanlanmagan");
      return;
    }

    // Check if attendance already exists (without the ability to edit)
    if (existingAttendance?.data && !existingAttendance?.data?.canEdit) {
      message.error(
        "Bu sana uchun davomat allaqachon kiritilgan va o'zgartirib bo'lmaydi"
      );
      return;
    }

    try {
      const attendanceData = {
        clubId: club._id,
        date: date.format("YYYY-MM-DD"),
        students: students.map((s) => ({
          student: s._id,
          present: s.present,
          reason: s.reason || null,
        })),
        notes: notes.trim() || null,
        telegramPostLink: telegramPostLink.trim() || null,
      };

      const result = await markAttendance(attendanceData).unwrap();

      if (result.success) {
        message.success("Davomat muvaffaqiyatli saqlandi");
        onClose();
      }
    } catch (error) {
      console.error("Attendance error:", error);
      message.error(
        error?.data?.message ||
          error?.message ||
          "Davomatni saqlashda xatolik yuz berdi"
      );
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

  // Mobile student card component
  const MobileStudentCard = ({ student }) => (
    <Card className="mb-3 shadow-sm" bodyStyle={{ padding: "12px" }}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              src={student.image}
              icon={!student.image && <UserOutlined />}
              size="large"
              className="bg-purple-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Text className="font-medium block truncate">
                {student.full_name}
              </Text>
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
    </Card>
  );

  // Desktop table columns
  const columns = [
    {
      title: "Student",
      key: "student",
      fixed: isMobile ? false : "left",
      width: isMobile ? 200 : 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            className="bg-purple-500 flex-shrink-0"
          />
          <div className="min-w-0">
            <Text className="font-medium block truncate">
              {record.full_name}
            </Text>
            <Text className="block text-xs text-gray-500">
              {record.student_id_number}
            </Text>
            {record.group && (
              <Text className="block text-xs text-gray-400 truncate">
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
      width: 150,
      render: (_, record) => (
        <Switch
          checked={record.present}
          onChange={(checked) => handlePresenceChange(record._id, checked)}
          checkedChildren="Keldi"
          unCheckedChildren="Yo'q"
        />
      ),
    },
    {
      title: "Sababni kiriting",
      key: "reason",
      render: (_, record) => (
        <Input
          placeholder="Kelmagan sababi..."
          value={record.reason}
          onChange={(e) => handleReasonChange(record._id, e.target.value)}
          disabled={record.present}
          size="small"
        />
      ),
    },
  ];

  const content = (
    <>
      {/* Mavjud davomat haqida ogohlantirish */}
      {existingAttendance?.data && (
        <Alert
          message="Bu sana uchun davomat allaqachon kiritilgan"
          description="Bu davomatni o'zgartirib bo'lmaydi"
          type="error"
          icon={<ExclamationCircleOutlined />}
          className="mb-4"
          showIcon
        />
      )}

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
      ) : filteredStudents.length > 0 ? (
        isMobile ? (
          <div className="max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => (
              <MobileStudentCard key={student._id} student={student} />
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{ y: 400, x: "max-content" }}
          />
        )
      ) : students.length === 0 ? (
        <Empty
          description="Bu to'garakda studentlar yo'q"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Empty
          description="Izlangan student topilmadi"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div className="mt-6 space-y-4">
        <div>
          <Text className="block mb-2">Telegram post linki:</Text>
          <Input
            placeholder="https://t.me/channel/123"
            value={telegramPostLink}
            onChange={(e) => setTelegramPostLink(e.target.value)}
            disabled={existingAttendance?.data}
          />
        </div>

        <div>
          <Text className="block mb-2">Qo'shimcha izoh:</Text>
          <TextArea
            placeholder="Dars haqida izoh yoki eslatma..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={existingAttendance?.data}
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
          <Tag color="purple" className="m-0">
            Jami: <span className="font-bold">{students.length}</span>
          </Tag>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex justify-end gap-2">
      <Button onClick={onClose} disabled={marking}>
        Bekor qilish
      </Button>
      {!existingAttendance?.data && (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSubmit}
          loading={marking}
          disabled={students.length === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
        >
          Saqlash
        </Button>
      )}
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
        footer={<div className="p-4 border-t">{footer}</div>}
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
      width={900}
      footer={footer}
      destroyOnClose
    >
      {content}
    </Modal>
  );
}
