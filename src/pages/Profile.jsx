import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  message,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { changePassword } from "../store/api/authApi";

const { Title, Text } = Typography;

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (values) => {
    try {
      setChangingPassword(true);
      const result = await dispatch(changePassword(values)).unwrap();
      if (result.success) {
        message.success("Parol muvaffaqiyatli o'zgartirildi");
        passwordForm.resetFields();
      }
    } catch (error) {
      message.error("Parolni o'zgartirishda xatolik");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      // API call for profile update would go here
      message.success("Profil ma'lumotlari yangilandi");
      setEditMode(false);
    } catch (error) {
      message.error("Profilni yangilashda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <Title level={3}>Mening profilim</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="text-center shadow-md border-0">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={user?.profile?.image}
              className="mb-4 bg-gradient-to-r from-purple-500 to-pink-600"
            />
            <Title level={4} className="!mb-1">
              {user?.profile?.fullName || user?.username}
            </Title>
            <Text className="text-gray-500">O'qituvchi</Text>

            <Divider />

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <UserOutlined className="text-gray-400" />
                <Text>Username: {user?.username}</Text>
              </div>

              {user?.profile?.email && (
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-gray-400" />
                  <Text>{user?.profile?.email}</Text>
                </div>
              )}

              {user?.profile?.phone && (
                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-gray-400" />
                  <Text>
                    {user?.profile?.phone
                      .replace("+998", "+998 ")
                      .replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4")}
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            <div className="bg-purple-50 rounded-lg p-4">
              <Text className="text-gray-600">Fakultet</Text>
              <div className="font-medium text-lg text-purple-600 mt-1">
                {user?.faculty?.name || "Belgilanmagan"}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Profil ma'lumotlari"
            className="shadow-md border-0 mb-6"
            extra={
              !editMode && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                >
                  Tahrirlash
                </Button>
              )
            }
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                fullName: user?.profile?.fullName,
                email: user?.profile?.email,
                phone: user?.profile?.phone,
              }}
              disabled={!editMode}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="To'liq ism"
                    name="fullName"
                    rules={[
                      { required: true, message: "Ism kiritilishi shart!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="To'liq ism"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { type: "email", message: "Email formati noto'g'ri!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Email manzil"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Telefon raqam" name="phone">
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="+998 90 123-45-67"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Username">
                    <Input
                      value={user?.username}
                      disabled
                      size="large"
                      className="bg-gray-50"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
                    >
                      Saqlash
                    </Button>
                    <Button
                      onClick={() => {
                        setEditMode(false);
                        profileForm.resetFields();
                      }}
                      size="large"
                    >
                      Bekor qilish
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>

          <Card title="Parolni o'zgartirish" className="shadow-md border-0">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Joriy parol"
                    name="oldPassword"
                    rules={[
                      {
                        required: true,
                        message: "Joriy parol kiritilishi shart!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Joriy parol"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Yangi parol"
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Yangi parol kiritilishi shart!",
                      },
                      {
                        min: 6,
                        message:
                          "Parol kamida 6 ta belgidan iborat bo'lishi kerak!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Yangi parol"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Yangi parolni tasdiqlash"
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Parolni tasdiqlang!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Parollar mos kelmayapti!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Yangi parolni tasdiqlang"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={changingPassword}
                  icon={<SaveOutlined />}
                  size="large"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
                >
                  Parolni o'zgartirish
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
