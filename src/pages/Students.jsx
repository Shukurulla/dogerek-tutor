import { useState } from "react";
import {
  Card,
  Select,
  Table,
  Avatar,
  Tag,
  Typography,
  Input,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useGetMyClubsQuery } from "../store/api/tutorApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Students() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { data: clubsData, isLoading } = useGetMyClubsQuery();
  const clubs = clubsData?.data || [];

  // Mock students data
  const students = selectedClub
    ? [
        {
          _id: "1",
          full_name: "Aliyev Jasur",
          student_id_number: "123456",
          image: null,
          group: { name: "101-guruh" },
          department: { name: "Matematika fakulteti" },
          phone: "+998901234567",
          email: "jasur@student.uz",
          attendance: 95,
        },
        {
          _id: "2",
          full_name: "Karimova Dilnoza",
          student_id_number: "123457",
          image: null,
          group: { name: "102-guruh" },
          department: { name: "Matematika fakulteti" },
          phone: "+998901234568",
          email: "dilnoza@student.uz",
          attendance: 98,
        },
        {
          _id: "3",
          full_name: "Rashidov Azizbek",
          student_id_number: "123458",
          image: null,
          group: { name: "201-guruh" },
          department: { name: "Matematika fakulteti" },
          phone: "+998901234569",
          email: "azizbek@student.uz",
          attendance: 87,
        },
      ]
    : [];

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.student_id_number.includes(searchText)
  );

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            size="large"
            className="bg-purple-500"
          />
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
      title: "Guruh",
      dataIndex: ["group", "name"],
      key: "group",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Fakultet",
      dataIndex: ["department", "name"],
      key: "department",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Kontakt",
      key: "contact",
      render: (_, record) => (
        <div className="space-y-1">
          {record.phone && (
            <div className="flex items-center gap-1 text-gray-600">
              <PhoneOutlined className="text-xs" />
              <Text className="text-sm">
                {record.phone
                  .replace("+998", "+998 ")
                  .replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4")}
              </Text>
            </div>
          )}
          {record.email && (
            <div className="flex items-center gap-1 text-gray-600">
              <MailOutlined className="text-xs" />
              <Text className="text-sm">{record.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Davomat",
      key: "attendance",
      render: (_, record) => {
        const color =
          record.attendance >= 90
            ? "success"
            : record.attendance >= 75
            ? "warning"
            : "error";
        return <Badge status={color} text={`${record.attendance}%`} />;
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-6">
      <Title level={3}>Studentlar</Title>

      <Card className="border-0 shadow-md">
        <div className="flex gap-4 mb-6">
          <Select
            placeholder="To'garakni tanlang"
            style={{ width: 250 }}
            value={selectedClub}
            onChange={setSelectedClub}
            size="large"
          >
            {clubs.map((club) => (
              <Select.Option key={club._id} value={club._id}>
                {club.name} ({club.totalStudents || 0} ta)
              </Select.Option>
            ))}
          </Select>

          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            size="large"
          />
        </div>

        {selectedClub ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border border-purple-200 bg-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-600">Jami studentlar</Text>
                    <div className="text-2xl font-bold text-purple-600 mt-1">
                      {filteredStudents.length}
                    </div>
                  </div>
                  <TeamOutlined className="text-3xl text-purple-400" />
                </div>
              </Card>

              <Card className="border border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-600">O'rtacha davomat</Text>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {filteredStudents.length > 0
                        ? (
                            filteredStudents.reduce(
                              (sum, s) => sum + s.attendance,
                              0
                            ) / filteredStudents.length
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                  <CheckCircleOutlined className="text-3xl text-green-400" />
                </div>
              </Card>

              <Card className="border border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-600">Faol studentlar</Text>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {
                        filteredStudents.filter((s) => s.attendance >= 75)
                          .length
                      }
                    </div>
                  </div>
                  <UserOutlined className="text-3xl text-blue-400" />
                </div>
              </Card>
            </div>

            <Table
              columns={columns}
              dataSource={filteredStudents}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Jami: ${total} ta`,
              }}
            />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <UserOutlined className="text-4xl mb-4 text-gray-300" />
            <Text>To'garakni tanlang</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
