import { cloneElement, useContext, useState } from "react";
import { useQueries } from "react-query";
import { Observable } from "rxjs";
import {
  DashboardFilter,
  FilteredIssues,
} from "../../repositories/dashboard.repository";
import { formatDateEnUs } from "../../../../core/helpers/date-utils";
import { ActiveIssuesComponent } from "../../components/active-issues/active-issues";
import { StatusCounts } from "../../models";
import { PtUser } from "../../../../core/models/domain";
import {
  PtDashboardServiceContext,
  PtStoreContext,
  PtUserServiceContext,
} from "../../../../App";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import "@progress/kendo-theme-default/dist/all.css";
import { ComboBox, ComboBoxChangeEvent } from "@progress/kendo-react-dropdowns";
import { DashboardChart } from "../../components/active-issues/dashboard-chart";

type DateRange = {
  dateStart: Date;
  dateEnd: Date;
};

export function DashboardPage() {
  const store = useContext(PtStoreContext);
  const userService = useContext(PtUserServiceContext);
  const dashboardService = useContext(PtDashboardServiceContext);

  const [filter, setFilter] = useState<DashboardFilter>({});
  const [selectedUser, setSelectedUser] = useState<PtUser | null>(null);

  function getQueryKey(keybase: string) {
    return [keybase, filter];
  }

  const users$: Observable<PtUser[]> = store.select<PtUser[]>("users");
  const [users, setUsers] = useState<PtUser[]>([]);

  const useDashboardData = (filter: DashboardFilter) => {
    return useQueries<[StatusCounts, FilteredIssues]>([
      {
        queryKey: getQueryKey("items"),
        queryFn: () => dashboardService.getStatusCounts(filter),
      },
      {
        queryKey: getQueryKey("issues"),
        queryFn: () => dashboardService.getFilteredIssues(filter),
      },
    ]);
  };

  const queryResult = useDashboardData(filter);
  const queryResult0 = queryResult[0];
  const queryResult1 = queryResult[1];

  const statusCounts = queryResult0?.data as StatusCounts | undefined;
  const filteredIssues = queryResult1?.data as FilteredIssues;

  function onMonthRangeTap(months: number) {
    const range = getDateRange(months);
    setFilter({
      userId: filter.userId,
      dateEnd: range.dateEnd,
      dateStart: range.dateStart,
    });
  }

  function getDateRange(months: number): DateRange {
    const now = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return {
      dateStart: start,
      dateEnd: now,
    };
  }

  function userFilterOpen() {
    users$.subscribe((uList: PtUser[]) => {
      if (uList.length > 0) {
        setUsers(uList);
      }
    });
    userService.fetchUsers();
  }

  function userFilterValueChange(e: ComboBoxChangeEvent) {
    const user = e.target.value;
    if (user) {
      setSelectedUser(user);
      setFilter({ ...filter, userId: user.id });
    } else {
      setSelectedUser(null);
      setFilter({ ...filter, userId: undefined });
    }
  }

  if (!statusCounts) {
    return <div>No data</div>;
  }

  function filterItemRender(li: any, itemProps: any) {
    const userItem = itemProps.dataItem as PtUser;
    const renderedRow = (
      <div className="row align-items-center">
        <div className="col-auto">
          <img
            className="li-avatar rounded"
            src={userItem.avatar}
            alt="avatar"
          />
        </div>
        <div className="col-auto">
          <span>{userItem.fullName}</span>
        </div>
      </div>
    );

    return cloneElement(li, li.props, renderedRow);
  }

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div className="col-md order-md-first text-center text-md-left">
          <h2>
            <span className="small text-uppercase text-muted d-block">
              Statistics
            </span>
            {filter.dateStart && filter.dateEnd && (
              <span>
                {" "}
                {formatDateEnUs(filter.dateStart)} -{" "}
                {formatDateEnUs(filter.dateEnd)}
              </span>
            )}
          </h2>
        </div>

        <div className="btn-toolbar mb-2 mb-md-0" style={{ gap: 20 }}>
          <div className="btn-group mr-2">
            <div className="btn-group mr-2">
              <ComboBox
                onOpen={userFilterOpen}
                onChange={userFilterValueChange}
                value={selectedUser}
                textField="fullName"
                dataItemKey="id"
                itemRender={filterItemRender}
                style={{ width: 250 }}
                data={users}
              ></ComboBox>
            </div>

            <ButtonGroup>
              <Button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => onMonthRangeTap(3)}
              >
                3 Months
              </Button>
              <Button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => onMonthRangeTap(6)}
              >
                6 Months
              </Button>
              <Button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => onMonthRangeTap(12)}
              >
                1 Year
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">Active Issues</h3>
        <div className="card-block">
          <ActiveIssuesComponent statusCounts={statusCounts} />

          <div className="row">
            <div className="col-sm-12">
              <h3>All issues</h3>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            {filteredIssues && <DashboardChart issuesAll={filteredIssues} />}
          </div>
        </div>
      </div>
    </div>
  );
}
