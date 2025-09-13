-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "photo_url" TEXT,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recommendation_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_data" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "selected_restaurant" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage_tracking" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "api_name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "cost_estimate" DOUBLE PRECISION NOT NULL,
    "response_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."algorithm_weights" (
    "id" TEXT NOT NULL,
    "social_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "personal_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "contextual_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "trends_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "algorithm_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "public"."users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "api_usage_tracking_api_name_created_at_idx" ON "public"."api_usage_tracking"("api_name", "created_at");

-- AddForeignKey
ALTER TABLE "public"."recommendation_history" ADD CONSTRAINT "recommendation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_usage_tracking" ADD CONSTRAINT "api_usage_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
