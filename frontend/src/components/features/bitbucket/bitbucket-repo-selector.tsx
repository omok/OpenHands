import React from "react";
import { useTranslation } from "react-i18next";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@nextui-org/react";
import { useDispatch } from "react-redux";
import posthog from "posthog-js";
import { I18nKey } from "#/i18n/declaration";
import { setSelectedRepository } from "#/state/initial-query-slice";
import { useConfig } from "#/hooks/query/use-config";
import { sanitizeQuery } from "#/utils/sanitize-query";

interface BitBucketRepository {
  uuid: string;
  full_name: string;
  name: string;
  workspace: {
    slug: string;
  };
  watchers_count: number;
}

interface BitBucketRepositorySelectorProps {
  onInputChange: (value: string) => void;
  onSelect: () => void;
  userRepositories: BitBucketRepository[];
  publicRepositories: BitBucketRepository[];
}

export function BitBucketRepositorySelector({
  onInputChange,
  onSelect,
  userRepositories,
  publicRepositories,
}: BitBucketRepositorySelectorProps) {
  const { t } = useTranslation();
  const { data: config } = useConfig();
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const allRepositories: BitBucketRepository[] = [
    ...publicRepositories.filter(
      (repo) => !publicRepositories.find((r) => r.uuid === repo.uuid),
    ),
    ...userRepositories,
  ];

  const dispatch = useDispatch();

  const handleRepoSelection = (uuid: string | null) => {
    const repo = allRepositories.find((r) => r.uuid === uuid);
    if (repo) {
      dispatch(setSelectedRepository(repo.full_name));
      posthog.capture("repository_selected");
      onSelect();
      setSelectedKey(uuid);
    }
  };

  const handleClearSelection = () => {
    dispatch(setSelectedRepository(null));
  };

  const emptyContent = t(I18nKey.BITBUCKET$NO_RESULTS);

  return (
    <Autocomplete
      data-testid="bitbucket-repo-selector"
      name="repo"
      aria-label="BitBucket Repository"
      placeholder={t(I18nKey.LANDING$SELECT_REPO)}
      isVirtualized={false}
      selectedKey={selectedKey}
      inputProps={{
        classNames: {
          inputWrapper:
            "text-sm w-full rounded-[4px] px-3 py-[10px] bg-[#525252] text-[#A3A3A3]",
        },
      }}
      onSelectionChange={(uuid) =>
        handleRepoSelection(uuid?.toString() ?? null)
      }
      onInputChange={onInputChange}
      clearButtonProps={{ onClick: handleClearSelection }}
      listboxProps={{
        emptyContent,
      }}
      defaultFilter={(textValue, inputValue) =>
        !inputValue ||
        sanitizeQuery(textValue).includes(sanitizeQuery(inputValue))
      }
    >
      {config?.APP_MODE === "saas" &&
        config?.APP_SLUG &&
        ((
          <AutocompleteItem key="install">
            <a
              href={`https://bitbucket.org/site/oauth2/authorize?client_id=${config.APP_SLUG}`}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
            >
              {t(I18nKey.BITBUCKET$ADD_MORE_REPOS)}
            </a>
          </AutocompleteItem> // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)}
      {userRepositories.length > 0 && (
        <AutocompleteSection
          showDivider
          title={t(I18nKey.BITBUCKET$YOUR_REPOS)}
        >
          {userRepositories.map((repo) => (
            <AutocompleteItem
              data-testid="bitbucket-repo-item"
              key={repo.uuid}
              value={repo.uuid}
              className="data-[selected=true]:bg-default-100"
              textValue={repo.full_name}
            >
              {repo.full_name}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      )}
      {publicRepositories.length > 0 && (
        <AutocompleteSection
          showDivider
          title={t(I18nKey.BITBUCKET$PUBLIC_REPOS)}
        >
          {publicRepositories.map((repo) => (
            <AutocompleteItem
              data-testid="bitbucket-repo-item"
              key={repo.uuid}
              value={repo.uuid}
              className="data-[selected=true]:bg-default-100"
              textValue={repo.full_name}
            >
              {repo.full_name}
              <span className="ml-1 text-gray-400">
                ({repo.watchers_count || 0}👀)
              </span>
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      )}
    </Autocomplete>
  );
}
