"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (values: ContactFormValues) => {
    // No backend this phase — vcb-api does not exist yet.
    console.log("contact form (no backend yet):", values);
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Hãy kết nối.</h1>
        <p className="mt-4 text-muted-foreground">
          Chúng tôi luôn sẵn sàng lắng nghe ý tưởng hợp tác, câu hỏi về sản phẩm và những điều bạn muốn chia sẻ.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Chia sẻ điều bạn quan tâm.</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" {...register("name")} placeholder="Nguyễn Văn A" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="ban@example.com" />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="company">Công ty / tổ chức (nếu có)</Label>
            <Input id="company" {...register("company")} placeholder="Tên doanh nghiệp" />
          </div>
          <div>
            <Label htmlFor="topic">Chủ đề liên hệ</Label>
            <select
              id="topic"
              {...register("topic")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
              <option value="Sản phẩm và showroom">Sản phẩm và showroom</option>
              <option value="Truyền thông">Truyền thông</option>
              <option value="Tuyển dụng">Tuyển dụng</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="message">Nội dung</Label>
            <Textarea id="message" {...register("message")} placeholder="Bạn muốn trao đổi điều gì?" />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>
          <Button type="submit">Soạn email ↗</Button>
        </form>
      </div>
    </section>
  );
}
