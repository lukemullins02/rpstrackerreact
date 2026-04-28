import { ItemType } from "../../../../core/constants";
import { PtItem } from "../../../../core/models/domain";
import {
  Grid,
  GridColumn,
  GridCellProps,
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridDataStateChangeEvent,
  GridRowClickEvent,
} from "@progress/kendo-react-grid";
import { getIndicatorClass } from "../../../../shared/helpers/priority-styling";
import { useState } from "react";
import { orderBy, State, process } from "@progress/kendo-data-query";
import { useNavigate } from "react-router-dom";

export type BacklogGridProps = {
  items: PtItem[];
};

const DateCell = (props: GridCellProps) => {
  return (
    <td>
      <span className="li-date">
        {new Date(props.dataItem.dateCreated).toDateString()}
      </span>
    </td>
  );
};

const AssigneeCell = (props: GridCellProps) => {
  return (
    <td>
      <div>
        <img
          src={props.dataItem.assignee.avatar}
          className="li-avatar rounded mx-auto"
          alt="Avatar"
        />
        <span style={{ marginLeft: 10 }}>
          {props.dataItem.assignee.fullName}
        </span>
      </div>
    </td>
  );
};

const IndicatorCell = (props: GridCellProps) => {
  return (
    <td>
      <img
        src={getIndicatorImage(props.dataItem)}
        className="backlog-icon"
        alt="Indicator"
      />
    </td>
  );
};

const priorityCell = (props: GridCellProps) => {
  return (
    <td>
      <span className={"badge " + getPriorityClass(props.dataItem)}>
        {props.dataItem.priority}
      </span>
    </td>
  );
};

function getIndicatorImage(item: PtItem) {
  return ItemType.imageResFromType(item.type);
}

function getPriorityClass(item: PtItem): string {
  const indicatorClass = getIndicatorClass(item.priority);
  return indicatorClass;
}

export function BackLogGrid(props: BacklogGridProps) {
  const navigate = useNavigate();

  const [gridState, setGridState] = useState<State>({
    skip: 0,
    take: 10,
    sort: [],
  });

  const gridData = process(props.items, gridState);

  function onDataStateChange(e: GridDataStateChangeEvent) {
    setGridState(e.dataState);
  }

  function onSelectionChange(e: GridRowClickEvent) {
    const setItem = e.dataItem as PtItem;
    navigate(`/detail/${setItem.id}`);
  }

  return (
    <Grid
      data={gridData}
      style={{ height: 400 }}
      take={gridState.take}
      skip={gridState.skip}
      total={props.items.length}
      pageable={true}
      sort={gridState.sort}
      sortable={true}
      onDataStateChange={(e) => onDataStateChange(e)}
      onRowClick={onSelectionChange}
    >
      <GridColumn
        field="type"
        title=" "
        width={40}
        cells={{ data: IndicatorCell }}
      />

      <GridColumn
        field="assignee"
        title="Assignee"
        width={200}
        cells={{ data: AssigneeCell }}
      ></GridColumn>
      <GridColumn field="title" title="Title" />
      <GridColumn
        field="priority"
        title="Priority"
        width={100}
        cells={{ data: priorityCell }}
      />
      <GridColumn field="estimate" title="Estimate" width={100} />
      <GridColumn
        field="dateCreated"
        title="Created"
        width={160}
        filter="date"
        cells={{ data: DateCell }}
      />
    </Grid>
  );
}
