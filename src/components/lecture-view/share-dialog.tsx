"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, QrCode as QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ShareDialogProps {
    lectureId: string;
    lectureTitle: string;
}

export function ShareDialog({ lectureId, lectureTitle }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${lectureId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Lecture Notes</DialogTitle>
                    <DialogDescription>
                        Anyone with this link can view your lecture notes.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link"
                                defaultValue={shareUrl}
                                readOnly
                                className="h-9"
                            />
                        </div>
                        <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <QrCodeIcon className="h-4 w-4" />
                            <span>Scan to open on mobile</span>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                            <QRCodeSVG value={shareUrl} size={200} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
