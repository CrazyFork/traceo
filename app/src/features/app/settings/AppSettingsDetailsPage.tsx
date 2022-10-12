import { Form, Space, Input, Button, Typography } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ColumnSection } from "../../../core/components/ColumnSection";
import AppSettingsNavigationPage from "../../../features/app/settings/components/AppSettingsNavigation";
import api from "../../../core/lib/api";
import { notify } from "../../../core/utils/notify";
import { handleStatus } from "../../../core/utils/response";
import { dispatch } from "../../../store/store";
import { ApiResponse } from "../../../types/api";
import { StoreState } from "../../../types/store";
import { MemberRole, UpdateApplicationProps } from "../../../types/application";
import { updateAplication } from "../state/actions";
import { useNavigate } from "react-router-dom";
import { Confirm } from "../../../core/components/Confirm";
import { Permissions } from "../../../core/components/Permissions";

export const AppSettingsDetailsPage = () => {
  const navigate = useNavigate();
  const { application } = useSelector((state: StoreState) => state.application);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

  if (!application) {
    return null;
  }

  const update = (update: UpdateApplicationProps) => {
    dispatch(updateAplication(update));
  };

  const remove = async () => {
    setLoadingDelete(true);
    try {
      const response: ApiResponse<string> = await api.delete(
        `/api/application/${application.id}`
      );
      if (handleStatus(response.status) === "success") {
        notify.success("App successfully deleted");
        navigate("/dashboard/overview");
      } else {
        notify.error("App not deleted. Please try again later.");
      }
    } catch (error) {
      notify.error(error);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <AppSettingsNavigationPage>
      <ColumnSection
        firstColumnWidth={12}
        secondColumnWidth={12}
        divider={true}
        title="Application name"
        subtitle="Name of your application."
      >
        <Form
          onFinish={update}
          name="personalInformation"
          layout="vertical"
          className="w-3/5"
        >
          <Space>
            <Form.Item
              name="name"
              label="Name"
              style={{ width: 300 }}
              className="font-semibold"
              initialValue={application?.name}
            >
              <Input disabled={application?.member?.role === MemberRole.VIEWER} />
            </Form.Item>
            <Permissions statuses={[MemberRole.ADMINISTRATOR, MemberRole.MAINTAINER]}>
              <Button htmlType="submit" className="mt-2" type="primary">
                Update
              </Button>
            </Permissions>
          </Space>
        </Form>
      </ColumnSection>
      {/* <ColumnSection
        firstColumnWidth={12}
        secondColumnWidth={12}
        divider={true}
        title="Default environment"
        subtitle="Set your default environment that you want to see right after open this application."
      >
        <Space direction="vertical" className="w-full">
          <Typography>Environment</Typography>
          <Select
            onChange={(defaultEnv: ENVIRONMENT) => update({ defaultEnv })}
            defaultValue={application?.defaultEnv}
            style={{ minWidth: "408px" }}
            disabled={application?.member?.role === MemberRole.VIEWER}
          >
            <Select.Option value={ENVIRONMENT.development}>Development</Select.Option>
            <Select.Option value={ENVIRONMENT.production}>Production</Select.Option>
            <Select.Option value={ENVIRONMENT.test}>Test</Select.Option>
          </Select>
        </Space>
      </ColumnSection> */}
      <Permissions statuses={[MemberRole.ADMINISTRATOR]}>
        <ColumnSection
          firstColumnWidth={12}
          secondColumnWidth={12}
          title={<Typography.Text className="text-red-700">Delete app</Typography.Text>}
          subtitle="Note that the removal of the application is immediate and irreversible. Only members with `Administrator` role can perform this operation."
        >
          <Space className="w-full mb-5">
            <Confirm
              withAuth={true}
              description="Are you sure that you want to remove this app?"
              onOk={() => remove()}
            >
              <Button type="primary" loading={loadingDelete} danger>
                Delete
              </Button>
            </Confirm>
          </Space>
        </ColumnSection>
      </Permissions>
    </AppSettingsNavigationPage>
  );
};

export default AppSettingsDetailsPage;
