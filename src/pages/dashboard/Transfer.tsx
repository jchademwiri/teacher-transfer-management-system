
import { MainNavigation } from '@/components/MainNavigation';
import { useTransferForm } from '@/hooks/use-transfer-form';
import { ActiveRequestView } from '@/components/transfer/ActiveRequestView';
import { TransferForm } from '@/components/transfer/TransferForm';

const TransferPage = () => {
  const {
    form,
    activeRequest,
    isLoading,
    isSubmitting,
    districts,
    filteredSchools,
    watchedDistrict,
    handleSubmitTransfer,
    handleWithdrawRequest,
    formatDate,
    getSchoolName,
  } = useTransferForm();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Transfer Request</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Transfer Request</h1>
          <p className="text-muted-foreground">Submit or view your active transfer request</p>
        </div>
        
        {activeRequest ? (
          <ActiveRequestView
            activeRequest={activeRequest}
            isSubmitting={isSubmitting}
            getSchoolName={getSchoolName}
            formatDate={formatDate}
            onWithdraw={handleWithdrawRequest}
          />
        ) : (
          <TransferForm
            form={form}
            districts={districts}
            filteredSchools={filteredSchools}
            watchedDistrict={watchedDistrict}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitTransfer}
          />
        )}
      </div>
    </div>
  );
};

export default TransferPage;
