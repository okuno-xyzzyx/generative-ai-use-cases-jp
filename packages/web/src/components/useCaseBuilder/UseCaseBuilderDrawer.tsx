import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiMagnifyingGlass, PiArrowsClockwise } from 'react-icons/pi';
import { BaseProps } from '../../@types/common';
import DrawerItem, { DrawerItemProps } from '../DrawerItem';
import DrawerBase from '../DrawerBase';
import ExpandableMenu from '../ExpandableMenu';
import ChatList from '../ChatList';
import Button from '../Button';

type Props = BaseProps & {
  items: DrawerItemProps[];
};

const UseCaseBuilderDrawer: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  const usecases = useMemo(() => {
    return props.items;
  }, [props.items]);

  const [searchQuery, setSearchQuery] = useState('');
  const searchWords = useMemo(() => {
    return searchQuery
      .split(' ')
      .flatMap((q) => q.split('　'))
      .filter((q) => q !== '');
  }, [searchQuery]);

  return (
    <>
      <DrawerBase>
        <div className="scrollbar-thin scrollbar-thumb-white h-full overflow-y-auto">
          <div className="text-aws-smile mx-3 my-2 text-xs">
            ユースケース管理
          </div>
          {usecases.map((item, idx) => (
            <DrawerItem
              key={idx}
              label={item.label}
              icon={item.icon}
              to={item.to}
              sub={item.sub}
            />
          ))}
          <div className="mt-2 border-b" />
          <ExpandableMenu
            title="マイユースケース"
            className="mx-3 my-2 text-xs">
            <div className="scrollbar-thin scrollbar-thumb-white ml-2 mr-1 h-1/3 overflow-y-auto">
              {/* <ChatList className="mr-1" searchWords={searchWords} /> */}
            </div>
          </ExpandableMenu>
          <div className="border-b" />
          <ExpandableMenu title="お気に入り" className="mx-3 my-2 text-xs">
            <div className="scrollbar-thin scrollbar-thumb-white ml-2 mr-1 h-full overflow-y-auto">
              {/* <ChatList className="mr-1" searchWords={searchWords} /> */}
            </div>
          </ExpandableMenu>
        </div>
        <div className="border-b" />
        <ExpandableMenu title="会話履歴" className="mx-3 my-2 text-xs">
          <div className="relative mb-2 ml-2 mr-1 w-full pl-1.5 pr-7 pt-1">
            <input
              className="bg-aws-squid-ink h-7 w-full rounded-full border border-white pl-8 text-sm text-white focus:border-white focus:ring-0"
              type="text"
              value={searchQuery}
              placeholder="件名で検索"
              onChange={(event) => {
                setSearchQuery(event.target.value ?? '');
              }}
            />
            <PiMagnifyingGlass className="bg-aws-squid-ink absolute left-1.5 top-1 size-7 rounded-l-full border border-white p-1.5" />
          </div>
          <div className="scrollbar-thin scrollbar-thumb-white ml-2 mr-1 h-full overflow-y-auto">
            <ChatList
              className="mr-1"
              searchWords={searchWords}
              isUseCaseBuilder
            />
          </div>
        </ExpandableMenu>
        <div className="flex items-center justify-center border-t border-gray-400 px-3 py-2">
          <Button
            onClick={() => {
              navigate('/');
            }}>
            <PiArrowsClockwise className="mr-2" />
            標準ユースケースへ
          </Button>
        </div>
      </DrawerBase>
    </>
  );
};

export default UseCaseBuilderDrawer;