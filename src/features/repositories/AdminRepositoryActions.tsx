import React from 'react';

import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuEye, LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ActionsButton } from '@/components/ActionsButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Icon } from '@/components/Icons';
import { useToastError } from '@/components/Toast';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/lib/trpc/types';

export type RepositoryActionProps = Omit<MenuProps, 'children'> & {
  repository: RouterOutputs['repositories']['getAll']['items'][number];
};

export const AdminRepositoryActions = ({
  repository,
  ...rest
}: RepositoryActionProps) => {
  const { t } = useTranslation(['common', 'repositories']);
  const trpcUtils = trpc.useUtils();

  const toastError = useToastError();

  const repositoryRemove = trpc.repositories.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.repositories.getAll.invalidate();
    },
    onError: () => {
      toastError({
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description'
        ),
      });
    },
  });

  return (
    <Menu placement="left-start" {...rest}>
      <MenuButton as={ActionsButton} isLoading={repositoryRemove.isLoading} />
      <Portal>
        <MenuList>
          <MenuItem
            as={LinkAdmin}
            href={`/repositories/${repository.id}`}
            icon={<Icon icon={LuEye} fontSize="lg" color="gray.400" />}
          >
            {t('repositories:list.actions.view')}
          </MenuItem>
          <MenuItem
            as={LinkAdmin}
            href={`/repositories/${repository.id}/update`}
            icon={<Icon icon={LuPenLine} fontSize="lg" color="gray.400" />}
          >
            {t('common:actions.edit')}
          </MenuItem>
          <MenuDivider />
          <ConfirmModal
            title={t('repositories:deleteModal.title')}
            message={t('repositories:deleteModal.message', {
              name: repository.name,
            })}
            onConfirm={() => repositoryRemove.mutate({ id: repository.id })}
            confirmText={t('common:actions.delete')}
            confirmVariant="@dangerSecondary"
          >
            <MenuItem
              icon={<Icon icon={LuTrash2} fontSize="lg" color="gray.400" />}
            >
              {t('common:actions.delete')}
            </MenuItem>
          </ConfirmModal>
        </MenuList>
      </Portal>
    </Menu>
  );
};
