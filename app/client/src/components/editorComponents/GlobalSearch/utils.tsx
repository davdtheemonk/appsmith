import React from "react";
import {
  createMessage,
  DOC_DESCRIPTION,
  NAV_DESCRIPTION,
  SNIPPET_DESCRIPTION,
} from "constants/messages";
import { ValidationTypes } from "constants/WidgetValidation";
import { Datasource } from "entities/Datasource";
import { useEffect, useState } from "react";
import { fetchRawGithubContentList } from "./githubHelper";
import { PluginType } from "entities/Action";
import getFeatureFlags from "utils/featureFlags";
import { modText } from "./HelpBar";
import { WidgetType } from "constants/WidgetConstants";
import { ENTITY_TYPE } from "entities/DataTree/dataTreeFactory";

export type SelectEvent =
  | React.MouseEvent
  | React.KeyboardEvent
  | KeyboardEvent
  | null;

export type RecentEntity = {
  type: string;
  id: string;
  params?: Record<string, string | undefined>;
};

export enum SEARCH_CATEGORY_ID {
  SNIPPETS = "Snippets",
  DOCUMENTATION = "Documentation",
  NAVIGATION = "Navigate",
  INIT = "INIT",
  LIBRARY = "LIBRARY",
}

export enum SEARCH_ITEM_TYPES {
  document = "document",
  action = "action",
  widget = "widget",
  datasource = "datasource",
  page = "page",
  sectionTitle = "sectionTitle",
  placeholder = "placeholder",
  jsAction = "jsAction",
  category = "category",
  snippet = "snippet",
}

export type DocSearchItem = {
  document?: string;
  title: string;
  _highlightResult: {
    document: { value: string };
    title: { value: string };
  };
  kind: string;
  path: string;
};

export const comboHelpText = {
  [SEARCH_CATEGORY_ID.SNIPPETS]: <>{modText()} + J</>,
  [SEARCH_CATEGORY_ID.DOCUMENTATION]: <>{modText()} + L</>,
  [SEARCH_CATEGORY_ID.NAVIGATION]: <>{modText()} + K</>,
  [SEARCH_CATEGORY_ID.INIT]: <>{modText()} + P</>,
  [SEARCH_CATEGORY_ID.LIBRARY]: <>{modText()} + I</>,
};

export type Snippet = {
  entities?: [string];
  fields?: [string];
  dataType?: string;
  language: string;
  body: SnippetBody;
};

export type SnippetBody = {
  title: string;
  snippet: string;
  isTrigger?: boolean;
  args: [SnippetArgument];
  summary: string;
  template: string;
  snippetMeta?: string;
  shortTitle?: string;
};

export type FilterEntity = WidgetType | ENTITY_TYPE;

//holds custom labels for snippet filters.
export const SnippetFilterLabel: Partial<Record<FilterEntity, string>> = {
  DROP_DOWN_WIDGET: "Dropdown",
};

export const getSnippetFilterLabel = (label: string) => {
  return (
    SnippetFilterLabel[label as FilterEntity] ||
    label
      .toLowerCase()
      .replace("_widget", "")
      .replace("-plugin", "")
      .replaceAll(/_|-/g, " ")
  );
};

export type SnippetArgument = {
  name: string;
  type: ValidationTypes;
};

export type SearchCategory = {
  id: SEARCH_CATEGORY_ID;
  kind?: SEARCH_ITEM_TYPES;
  title?: string;
  desc?: string;
  show?: () => boolean;
};

export function getOptionalFilters(optionalFilterMeta: any) {
  return Object.keys(optionalFilterMeta || {}).map(
    (field) => `${field}:${optionalFilterMeta[field]}`,
  );
}

export const filterCategories: Record<SEARCH_CATEGORY_ID, SearchCategory> = {
  [SEARCH_CATEGORY_ID.NAVIGATION]: {
    title: "Navigate",
    kind: SEARCH_ITEM_TYPES.category,
    id: SEARCH_CATEGORY_ID.NAVIGATION,
    desc: createMessage(NAV_DESCRIPTION),
  },
  [SEARCH_CATEGORY_ID.SNIPPETS]: {
    title: "Use Snippets",
    kind: SEARCH_ITEM_TYPES.category,
    id: SEARCH_CATEGORY_ID.SNIPPETS,
    desc: createMessage(SNIPPET_DESCRIPTION),
    show: () => getFeatureFlags().SNIPPET,
  },
  [SEARCH_CATEGORY_ID.DOCUMENTATION]: {
    title: "Search Documentation",
    kind: SEARCH_ITEM_TYPES.category,
    id: SEARCH_CATEGORY_ID.DOCUMENTATION,
    desc: createMessage(DOC_DESCRIPTION),
  },
  [SEARCH_CATEGORY_ID.LIBRARY]: {
    title: "Install Libraries",
    kind: SEARCH_ITEM_TYPES.category,
    id: SEARCH_CATEGORY_ID.LIBRARY,
    desc: "Search and install libraries from cdnjs.",
  },
  [SEARCH_CATEGORY_ID.INIT]: {
    id: SEARCH_CATEGORY_ID.INIT,
  },
};

export const isNavigation = (category: SearchCategory) =>
  category.id === SEARCH_CATEGORY_ID.NAVIGATION;
export const isDocumentation = (category: SearchCategory) =>
  category.id === SEARCH_CATEGORY_ID.DOCUMENTATION;
export const isSnippet = (category: SearchCategory) =>
  category.id === SEARCH_CATEGORY_ID.SNIPPETS;
export const isMenu = (category: SearchCategory) =>
  category.id === SEARCH_CATEGORY_ID.INIT;
export const isLibrary = (category: SearchCategory) =>
  category.id === SEARCH_CATEGORY_ID.LIBRARY;

export const getFilterCategoryList = () =>
  Object.values(filterCategories).filter((cat: SearchCategory) => {
    return cat.show ? cat.show() : true;
  });

export type SearchItem = DocSearchItem | Datasource | any;

// todo better checks here?
export const getItemType = (item: SearchItem): SEARCH_ITEM_TYPES => {
  let type: SEARCH_ITEM_TYPES;
  if (item.widgetName) type = SEARCH_ITEM_TYPES.widget;
  else if (
    item.kind === SEARCH_ITEM_TYPES.document ||
    item.kind === SEARCH_ITEM_TYPES.page ||
    item.kind === SEARCH_ITEM_TYPES.sectionTitle ||
    item.kind === SEARCH_ITEM_TYPES.placeholder ||
    item.kind === SEARCH_ITEM_TYPES.category
  )
    type = item.kind;
  else if (item.kind === SEARCH_ITEM_TYPES.page) type = SEARCH_ITEM_TYPES.page;
  else if (item.config?.pluginType === PluginType.JS)
    type = SEARCH_ITEM_TYPES.jsAction;
  else if (item.config?.name) type = SEARCH_ITEM_TYPES.action;
  else if (item.body?.snippet) type = SEARCH_ITEM_TYPES.snippet;
  else type = SEARCH_ITEM_TYPES.datasource;

  return type;
};

export const getItemTitle = (item: SearchItem): string => {
  const type = getItemType(item);

  switch (type) {
    case SEARCH_ITEM_TYPES.action:
    case SEARCH_ITEM_TYPES.jsAction:
      return item?.config?.name;
    case SEARCH_ITEM_TYPES.widget:
      return item?.widgetName;
    case SEARCH_ITEM_TYPES.datasource:
      return item?.name;
    case SEARCH_ITEM_TYPES.page:
      return item?.pageName;
    case SEARCH_ITEM_TYPES.sectionTitle:
    case SEARCH_ITEM_TYPES.placeholder:
    case SEARCH_ITEM_TYPES.document:
      return item?.title;
    case SEARCH_ITEM_TYPES.snippet:
      return item.title;
    default:
      return "";
  }
};

export const getItemPage = (item: SearchItem): string => {
  const type = getItemType(item);

  switch (type) {
    case SEARCH_ITEM_TYPES.action:
    case SEARCH_ITEM_TYPES.jsAction:
      return item?.config?.pageId;
    case SEARCH_ITEM_TYPES.widget:
    case SEARCH_ITEM_TYPES.page:
      return item?.pageId;
    default:
      return "";
  }
};

// Helper function to keep calling
// github fetch until either number
// of retries is over or the content
// is succesfully fetched
export const fetchDefaultDocs = async (
  updateIsFetching: (b: boolean) => void,
  setDefaultDocs: (t: DocSearchItem[]) => void,
  retries: number,
  maxRetries: number,
) => {
  if (maxRetries <= retries) {
    updateIsFetching(false);
    return;
  }
  updateIsFetching(true);
  try {
    const data = await fetchRawGithubContentList();
    setDefaultDocs(data);
    updateIsFetching(false);
  } catch (e) {
    updateIsFetching(false);
    // We don't want to fetch
    // immediately to avoid
    // same error again
    setTimeout(
      () =>
        fetchDefaultDocs(
          updateIsFetching,
          setDefaultDocs,
          retries + 1,
          maxRetries,
        ),
      500 * maxRetries,
    );
  }
};

export const useDefaultDocumentationResults = (modalOpen: boolean) => {
  const [defaultDocs, setDefaultDocs] = useState<DocSearchItem[]>([]);
  const [isFetching, updateIsFetching] = useState(false);
  useEffect(() => {
    if (!isFetching && !defaultDocs.length) {
      // Keep trying to fetch until a max retries is reached
      fetchDefaultDocs(updateIsFetching, setDefaultDocs, 0, 2);
    }
  }, [modalOpen]);

  return defaultDocs;
};

export const algoliaHighlightTag = "ais-highlight-0000000000";

export const attachKind = (source: any[], kind: string) => {
  return source.map((s) => ({
    ...s,
    kind,
  }));
};

export const getEntityId = (entity: any) => {
  const { entityType } = entity;
  switch (entityType) {
    case "page":
      return entity.pageId;
    case "datasource":
      return entity.id;
    case "widget":
      return entity.widgetId;
    case "action":
      return entity.config?.id;
  }
};
