import {
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Typography,
  List,
  Avatar,
  Empty,
  Button,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useGetMyClubsQuery } from "../store/api/tutorApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function MyClubs() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyClubsQuery();
  const clubs = data?.data || [];

  const weekDays = {
    1: "Dushanba",
    2: "Seshanba",
    3: "Chorshanba",
    4: "Payshanba",
    5: "Juma",
    6: "Shanba",
    7: "Yakshanba",
  };

  const weekType = {
    odd: "Toq haftalar",
    even: "Juft haftalar",
    both: "Har hafta",
  };

  if (isLoading) return <LoadingSpinner size="large" />;

  if (clubs.length === 0) {
    return (
      <div className="space-y-6">
        <Title level={3}>Mening to'garaklarim</Title>
        <Card className="text-center py-12">
          <Empty description="Sizga hali to'garak biriktirilmagan" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Mening to'garaklarim</Title>
        <Text className="text-gray-500">Jami: {clubs.length} ta</Text>
      </div>

      <Row gutter={[16, 16]}>
        {clubs.map((club) => {
          const percentage = club.capacity
            ? ((club.totalStudents || 0) / club.capacity) * 100
            : 0;

          return (
            <Col xs={24} lg={12} key={club._id}>
              <Card
                className="shadow-md border-0 hover:shadow-lg transition-shadow h-full"
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <BookOutlined className="text-purple-600 text-lg" />
                    </div>
                    <div>
                      <Text className="font-medium text-base">{club.name}</Text>
                      {club.faculty && (
                        <Text className="block text-xs text-gray-500">
                          {club.faculty.name}
                        </Text>
                      )}
                    </div>
                  </div>
                }
                extra={
                  club.telegramChannelLink && (
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={club.telegramChannelLink}
                      target="_blank"
                    >
                      Telegram
                    </Button>
                  )
                }
              >
                <div className="space-y-4">
                  {club.description && (
                    <Text className="text-gray-600">{club.description}</Text>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-gray-400" />
                      <Text className="text-sm">
                        {club.schedule?.time?.start} -{" "}
                        {club.schedule?.time?.end}
                      </Text>
                      <Tag color="purple">
                        {weekType[club.schedule?.weekType]}
                      </Tag>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-400" />
                      <div className="flex gap-1">
                        {club.schedule?.days?.map((day) => (
                          <Tag key={day} color="blue">
                            {weekDays[day]}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {club.location && (
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-gray-400" />
                        <Text className="text-sm">{club.location}</Text>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-gray-600">Studentlar</Text>
                      <Text className="font-medium">
                        {club.totalStudents || 0} / {club.capacity || "∞"}
                      </Text>
                    </div>
                    {club.capacity && (
                      <Progress
                        percent={percentage}
                        strokeColor={{
                          "0%": "#722ed1",
                          "100%": "#eb2f96",
                        }}
                        showInfo={false}
                      />
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      onClick={() =>
                        navigate("/students", { state: { clubId: club._id } })
                      }
                      className="flex-1 bg-purple-600 border-0"
                    >
                      Studentlar
                    </Button>
                    <Button
                      icon={<CalendarOutlined />}
                      onClick={() =>
                        navigate("/attendance", { state: { clubId: club._id } })
                      }
                      className="flex-1"
                    >
                      Davomat
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
