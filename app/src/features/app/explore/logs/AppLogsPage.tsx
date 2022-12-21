import { TraceoLoading } from "../../../../core/components/TraceoLoading";
import { useSelector } from "react-redux";
import { LogLevel } from "../../../../types/logs";
import { StoreState } from "../../../../types/store";
import AppExploreNavigationPage from "../components/AppExploreNavigation";

import { Divider, Space, Tag, Typography } from "antd";
import { ConditionalWrapper } from "../../../../core/components/ConditionLayout";
import { LogsHistogram } from "../../../../features/app/explore/components/LogsHistogram";
import { LogContainer, LogRow } from "../components/LogContainer";
import { DataNotFound } from "../../../../core/components/DataNotFound";
import { PagePanel } from "../../../../core/components/PagePanel";
import { LoadingOutlined } from "@ant-design/icons";

const AppLogsPage = () => {
  const { logs, hasFetched } = useSelector((state: StoreState) => state.logs);

  if (!logs) {
    return <TraceoLoading />;
  }

  const errorLogsCount = logs?.filter((log) => log.level === LogLevel.Error).length;

  const LogDetails = () => {
    // TODO: remove this
    const logsDetails = [
      {
        label: "Fetched logs:",
        value: logs.length
      },
      {
        label: "Error logs:",
        value: errorLogsCount
      },
      {
        label: "Logs limit:",
        value: 1000
      },
      {
        label: "Logs retention:",
        value: "3 days"
      }
    ];
    return (
      <Space className="w-full">
        {logsDetails.map(({ label, value }, index) => (
          <Typography.Text key={index} className="text-xs">
            {label} <Tag>{value}</Tag>
          </Typography.Text>
        ))}
      </Space>
    );
  };

  return (
    <AppExploreNavigationPage>
      <LogsHistogram />
      <PagePanel title="Logs list">
        <LogDetails />
        <Divider className="my-2" />
        <ConditionalWrapper
          emptyView={<DataNotFound label="Logs not found" />}
          isEmpty={logs?.length === 0}
          isLoading={!hasFetched && !logs}
        >
          <LogContainer>
            {logs?.map((log, index) => (
              <LogRow key={index} log={log} />
            ))}
          </LogContainer>
        </ConditionalWrapper>
      </PagePanel>
    </AppExploreNavigationPage>
  );
};

export default AppLogsPage;
