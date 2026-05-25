import {
  Box,
  Container,
  Divider,
  Flex,
  Image,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { Children, Fragment, type ReactElement, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScalableIcon } from '@/components/common/ScalableIcon'
import BrandGithub from '@/components/icons/BrandGithub'
import Page from '@/components/layout/Page'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import useVersion from '@/hooks/useVersion'
import platform from '@/platform'
import iconPNG from '@/static/icon.png'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const version = useVersion()
  const isSmallScreen = useIsSmallScreen()

  return (
    <Page title={t('About')}>
      <Container size="md" p={0}>
        <Stack gap="xxl" px={isSmallScreen ? 'sm' : 'md'} py={isSmallScreen ? 'xl' : 'md'}>
          <Flex gap="xxl" p="md" className="rounded-lg bg-chatbox-background-secondary">
            <Image h={100} w={100} mah={'20vw'} maw={'20vw'} src={iconPNG} />
            <Stack flex={1} gap="xxs">
              <Flex justify="space-between" align="center" wrap="wrap" gap={isSmallScreen ? 'xs' : 'sm'} rowGap="xs">
                <Title order={5} lh={1.5} lineClamp={1} title={`Chatbox Plus v${version.version}`}>
                  Chatbox Plus {/\d/.test(version.version) ? `(v${version.version})` : ''}
                </Title>
              </Flex>
              <Text>{t('about-slogan')}</Text>
              <Text c="chatbox-tertiary">Unofficial GPLv3 fork of Chatbox Community Edition.</Text>
              <Text c="chatbox-tertiary">{t('about-introduction')}</Text>
            </Stack>
          </Flex>

          <List>
            <ListItem
              icon={<BrandGithub className="w-full h-full" />}
              title={t('Github')}
              link="https://github.com/Labyrinth0419/chatbox-plus"
              value="chatbox-plus"
            />
          </List>
        </Stack>

        {/* 开发环境下显示错误测试面板 */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 max-w-md">
            <ErrorTestPanel />
          </div>
        )} */}
      </Container>
    </Page>
  )
}

function List(props: { children: ReactNode }) {
  const children = Children.toArray(props.children)

  return (
    <Stack gap={0} className="rounded-lg bg-chatbox-background-secondary">
      {children.map((child, index) => (
        <Fragment key={`child-${index}`}>
          {child}
          {index !== children.length - 1 && <Divider />}
        </Fragment>
      ))}
    </Stack>
  )
}

function ListItem({
  icon,
  title,
  link,
  value,
  right,
}: {
  icon: ReactElement
  title: string
  link?: string
  value?: string
  right?: ReactElement
}) {
  return (
    <Flex
      px="md"
      py="sm"
      gap="xs"
      align="center"
      className={link ? 'cursor-pointer' : ''}
      onClick={() => link && platform.openLink(link)}
      c="chatbox-tertiary"
    >
      <Box w={20} h={20} className="flex-shrink-0 " c="chatbox-primary">
        {icon}
      </Box>
      <Text flex={1} size="md">
        {title}
      </Text>

      {right ? (
        right
      ) : (
        <>
          {value && (
            <Text size="md" c="chatbox-tertiary">
              {value}
            </Text>
          )}
          {link && <ScalableIcon icon={IconChevronRight} size={20} className="!text-inherit" />}
        </>
      )}
    </Flex>
  )
}
