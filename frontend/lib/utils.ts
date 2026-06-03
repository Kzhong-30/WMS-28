import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const fromNow = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const formatNumber = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

export const extractHeadings = (html: string): { id: string; text: string; level: number }[] => {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h\1>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), id: match[2], text: match[3].trim() });
  }
  return headings;
};

export const truncate = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};
