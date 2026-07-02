import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button } from '@fluentui/react-components'

interface ConfirmDialogProps {
  trigger: React.ReactElement
  title: string
  content: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmDialog({ trigger, title, content, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, destructive }: ConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>{trigger}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">{cancelLabel}</Button>
            </DialogTrigger>
            <Button appearance={destructive ? 'primary' : 'secondary'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
