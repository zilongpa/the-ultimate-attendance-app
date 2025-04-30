// By Junhui Huang
import { PageContainer } from '@toolpad/core/PageContainer';
import UserAttendanceReport from '@/components/UserAttendanceReport';

export default async function Attendance({
    params,
}: {
    params: Promise<{ id: number }>;
}) {
    const { id } = await params;
    return (
        <PageContainer>
            <UserAttendanceReport id={id} />
        </PageContainer >
    );
}
